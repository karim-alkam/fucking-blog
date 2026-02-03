"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3-force';
import { GraphWindowHeader } from '../posts/components/graph/GraphWindowHeader';

// Dynamically import generic ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="h-[60vh] flex items-center justify-center text-cyber-neon-cyan/50 animate-pulse">Initializing Neural Link...</div>
});

interface Node {
    id: string;
    name: string;
    val: number;
    type: string;
    slug: string;
    x?: number;
    y?: number;
    color?: string;
    neighbors?: Node[];
    links?: Link[];
}

interface Link {
    source: string | Node;
    target: string | Node;
    type: string;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

export default function HomeGraph() {
    const router = useRouter();
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(null);
    const [showTutorial, setShowTutorial] = useState(false);

    // Handle Touch Interactions for Mobile UX (Tutorial Only)
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setShowTutorial(true);
            const timer = setTimeout(() => setShowTutorial(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setShowTutorial(false);
        }
    };

    // Track if forces have been verified/applied for the current data cycle
    const isForcesApplied = useRef(false);

    // Resize handler
    useEffect(() => {
        function handleResize() {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight - 32
                });
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Data
    useEffect(() => {
        fetch('/graph-data.json')
            .then(res => res.json())
            .then((graphData: GraphData) => {
                const internalNodes = graphData.nodes.filter(n => n.type !== 'external');
                const nodeIds = new Set(internalNodes.map(n => n.id));
                const internalLinks = graphData.links.filter(l =>
                    nodeIds.has(typeof l.source === 'object' ? (l.source as Node).id : l.source as string) &&
                    nodeIds.has(typeof l.target === 'object' ? (l.target as Node).id : l.target as string)
                );

                const nodesById = new Map(internalNodes.map(n => [n.id, n]));
                internalNodes.forEach(node => {
                    node.neighbors = [];
                    node.links = [];
                });

                internalLinks.forEach(link => {
                    const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source;
                    const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target;
                    const source = nodesById.get(sourceId as string);
                    const target = nodesById.get(targetId as string);

                    if (source && target) {
                        source.neighbors!.push(target);
                        target.neighbors!.push(source);
                        source.links!.push(link);
                        target.links!.push(link);
                    }
                });

                internalNodes.forEach(node => {
                    const connectionCount = node.neighbors!.length;
                    node.val = 4 + (connectionCount * 1.5);
                    node.color = '#00F0FF';
                });

                isForcesApplied.current = false; // Reset force flag on new data
                setData({ nodes: internalNodes, links: internalLinks });
            })
            .catch(err => console.error("Failed to load graph data", err));
    }, []);

    // Encapsulate force logic
    const applyCustomForces = useCallback(() => {
        if (!fgRef.current || data.nodes.length === 0) return;
        const graph = fgRef.current;

        // Physics Constants
        const CHARGE_STRENGTH = -35;
        const LINK_DISTANCE = 35;

        // Clear default forces
        graph.d3Force('center', null);
        graph.d3Force('charge', null);

        // 1. Repulsion
        graph.d3Force('charge', d3.forceManyBody()
            .strength(CHARGE_STRENGTH)
            .distanceMax(400)
        );

        // 2. Link Force
        graph.d3Force('link')
            .distance(LINK_DISTANCE)
            .strength(0.2);

        // 3. Collision Force (Soft & Tight)
        // Prevent overlap by using exact node radius, but soft strength to allow "breathing"
        graph.d3Force('collide', d3.forceCollide((node: any) => node.val)
            .strength(0.2)
        );

        // 4. Radial & Centering
        // 4. Center Gravity (Organic Drift)
        // Gentle gravity to keep nodes from floating away too far, replacing rigid radial forces
        graph.d3Force('centerClusterX', d3.forceX(0).strength(0.05));
        graph.d3Force('centerClusterY', d3.forceY(0).strength(0.05));

        // Remove old radial/orphan forces if they exist
        graph.d3Force('orphanRadial', null);

    }, [data, dimensions]);

    // Re-apply if dimensions change
    useEffect(() => {
        if (isForcesApplied.current) {
            applyCustomForces();
            fgRef.current?.d3ReheatSimulation();
        }
    }, [dimensions, applyCustomForces]);


    const [hoverNode, setHoverNode] = useState<Node | null>(null);

    const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        const radius = node.val;
        const isHovered = node === hoverNode;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || '#00F0FF';
        ctx.shadowColor = node.color || '#00F0FF';
        ctx.shadowBlur = isHovered ? 25 : 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isHovered || globalScale > 2.25) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(label, node.x, node.y + radius + 2 + fontSize);
        }
    }, [hoverNode]);

    return (
        <section className="relative min-h-[70vh] flex flex-col my-10 container mx-auto max-w-7xl px-4">
            {/* Section Header */}
            <div className="mb-12 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyber-gray pb-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-cyber-white uppercase tracking-wider mb-2">
                            <span className="glitch" data-text="NEURAL_NETWORK_MAP">NEURAL_NETWORK_MAP</span>
                        </h2>
                        <p className="text-cyber-gray-light font-mono text-sm">
                            INTERACTIVE SYSTEM VISUALIZATION
                        </p>
                    </div>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, scaleY: 0, filter: 'brightness(2) hue-rotate(90deg)' }}
                animate={{ opacity: 1, scaleY: 1, filter: 'brightness(1) hue-rotate(0deg)' }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                style={{ originY: 0 }}
                className="flex flex-col border border-cyber-neon-cyan bg-cyber-black relative shadow-lg shadow-cyber-neon-cyan/20 w-full max-w-5xl mx-auto overflow-hidden h-[600px] [&_canvas]:!touch-auto"
                ref={containerRef}
                onTouchStart={handleTouchStart}
            >

                {/* Scanline Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.05)_50%)] bg-[length:100%_4px] opacity-50"></div>
                <motion.div
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    className="absolute left-0 right-0 h-[2px] bg-cyber-neon-cyan/30 z-20 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                />

                {/* Header Section */}
                <GraphWindowHeader title="NEURAL_NETWORK_v1.0" />

                <div className="flex-1 relative w-full overflow-hidden bg-cyber-black/50 backdrop-blur-sm">
                    <ForceGraph2D
                        ref={fgRef}
                        width={dimensions.width}
                        // Ensure height doesn't go negative on initial render
                        height={Math.max(1, dimensions.height)}
                        graphData={data}
                        nodeLabel={null as any} // Removed to prevent double labels (handled in nodeCanvasObject)
                        backgroundColor="#050505"
                        nodeColor="color"
                        linkColor={() => 'rgba(92, 92, 92, 1)'}
                        linkDirectionalParticles={0.5}
                        nodeCanvasObject={(node, ctx, globalScale) => nodeCanvasObject(node, ctx, globalScale)}
                        onNodeHover={(node) => {
                            setHoverNode(node as Node || null);
                            document.body.style.cursor = node ? 'pointer' : 'default';
                        }}
                        onNodeClick={(node) => {
                            if (node && node.slug) {
                                router.push(`/posts/${node.slug}`);
                            }
                        }}
                        onEngineTick={() => {
                            // Apply custom forces on the very first frame of the simulation cycle
                            if (!isForcesApplied.current && fgRef.current) {
                                applyCustomForces();
                                isForcesApplied.current = true;
                            }
                        }}
                        cooldownTicks={100}
                        enableNodeDrag={true}
                        minZoom={0.5}
                        maxZoom={4}
                        d3VelocityDecay={0.25}
                        // Custom interaction filter: Ignore 1-finger touch to allow scrolling
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        enablePanInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        enableZoomInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
                    />

                    {/* Mobile Tutorial Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showTutorial ? 1 : 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-cyber-black/80 pointer-events-none"
                    >
                        <div className="text-cyber-neon-cyan font-mono text-sm font-bold bg-cyber-dark-gray border border-cyber-neon-cyan px-4 py-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                            USE TWO FINGERS TO MOVE
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
