"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3-force';

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

    // Track if forces have been verified/applied for the current data cycle
    const isForcesApplied = useRef(false);

    // Resize handler
    useEffect(() => {
        function handleResize() {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
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
        const CHARGE_STRENGTH = -100;
        const LINK_DISTANCE = 40;

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
            .strength(0.8);

        // 3. Collision Force (Soft & Tight)
        // Prevent overlap by using exact node radius, but soft strength to allow "breathing"
        graph.d3Force('collide', d3.forceCollide((node: any) => node.val)
            .strength(0.7)
        );

        // 4. Radial & Centering
        const orphans = data.nodes.filter(n => (!n.neighbors || n.neighbors.length === 0));
        const connected = data.nodes.filter(n => (n.neighbors && n.neighbors.length > 0));
        const orphanIds = new Set(orphans.map(n => n.id));

        graph.d3Force('centerClusterX', d3.forceX(0).strength((d: any) => orphanIds.has(d.id) ? 0 : 0.08));
        graph.d3Force('centerClusterY', d3.forceY(0).strength((d: any) => orphanIds.has(d.id) ? 0 : 0.08));

        // Physics-Aware Radius Calculation
        // Radius = (√N * LinkDist) + (OrphanExpansionPressure)
        const connectedCount = connected.length;
        const basePackingRadius = Math.sqrt(connectedCount) * LINK_DISTANCE / 2;
        const repulsionExpansion = connectedCount * Math.abs(CHARGE_STRENGTH) * 0.005; // Tuned coefficient

        const calculatedRadius = basePackingRadius + repulsionExpansion;

        // Clamp radius to ensure it fits within screen bounds (with some margin)
        const minDim = Math.min(dimensions.width, dimensions.height);
        const maxAllowedRadius = (minDim / 2) * 0.8;

        const targetRadius = Math.min(calculatedRadius, maxAllowedRadius);

        // Organic Layout: Soft Radial Pull
        // We gently pull orphans towards the target radius.
        // Collision and Repulsion forces will naturally distribute them into a "cloud" or "band".
        graph.d3Force('orphanRadial', d3.forceRadial(targetRadius, 0, 0)
            .strength((d: any) => orphanIds.has(d.id) ? 0.2 : 0) // Low strength for organic drift
        );

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

        if (isHovered || globalScale > 1.5) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(label, node.x, node.y + radius + 2 + fontSize);
        }
    }, [hoverNode]);

    return (
        <section className="relative min-h-[70vh] flex flex-col items-center justify-center my-10">
            <div className="max-w-5xl w-full mx-auto border border-cyber-gray bg-cyber-black/50 backdrop-blur-sm relative overflow-hidden h-[600px] rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]" ref={containerRef}>
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h3 className="text-cyber-neon-cyan font-mono text-xs tracking-widest uppercase mb-1">Neural Network</h3>
                    <p className="text-cyber-gray-light text-[10px]">Interactive Post Graph</p>
                </div>

                <ForceGraph2D
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={data}
                    nodeLabel="name"
                    backgroundColor="#050505"
                    nodeColor="color"
                    linkColor={() => 'rgba(136, 136, 136, 0.2)'}
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
                    enableZoomInteraction={true}
                    minZoom={0.5}
                    maxZoom={4}
                />
            </div>
        </section>
    );
}
