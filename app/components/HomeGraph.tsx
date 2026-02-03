"use client";

import { useEffect, useState, useCallback, useRef, Fragment } from 'react';
import dynamic from 'next/dynamic';

import { useRouter } from 'next/navigation';
import * as d3 from 'd3-force';
import { Dialog, Transition } from '@headlessui/react';
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
    fx?: number;
    fy?: number;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [hoverNode, setHoverNode] = useState<Node | null>(null);

    // Toggle Maximize
    const toggleMaximize = useCallback(() => {
        setIsMaximized(prev => !prev);
        // Reset forces flag because a NEW graph instance will be mounted in the modal
        // This ensures applyCustomForces() is called again for the new instance.
        isForcesApplied.current = false;
    }, []);

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
    const handleResize = useCallback(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight - 32
            });
        }
    }, []);

    useEffect(() => {
        handleResize();
        const resizeObserver = new ResizeObserver(() => handleResize());
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [handleResize]);

    // Modal Resize Logic
    const [modalDimensions, setModalDimensions] = useState({ width: 800, height: 600 });
    const modalContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMaximized) return;

        const updateModalSize = () => {
            if (modalContainerRef.current) {
                setModalDimensions({
                    width: modalContainerRef.current.offsetWidth,
                    height: modalContainerRef.current.offsetHeight
                });
            }
        };

        // Initial measure
        const timer = setTimeout(updateModalSize, 100);

        const resizeObserver = new ResizeObserver(() => updateModalSize());

        if (modalContainerRef.current) {
            resizeObserver.observe(modalContainerRef.current);
        }

        window.addEventListener('resize', updateModalSize);

        return () => {
            window.removeEventListener('resize', updateModalSize);
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [isMaximized]);

    // Fetch Data
    useEffect(() => {
        fetch('/graph-data.json')
            .then(res => res.json())
            .then((graphData: GraphData) => {
                const allNodesMap = new Map(graphData.nodes.map(n => [n.id, n]));
                const nodeInternalDegree = new Map<string, number>();
                const nodeExternalDegree = new Map<string, number>();

                // Initialize counts
                graphData.nodes.forEach(n => {
                    nodeInternalDegree.set(n.id, 0);
                    nodeExternalDegree.set(n.id, 0);
                });

                // Calculate degrees from ALL links
                graphData.links.forEach(link => {
                    const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source as string;
                    const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target as string;
                    const sourceNode = allNodesMap.get(sourceId);
                    const targetNode = allNodesMap.get(targetId);

                    if (sourceNode && targetNode) {
                        const isSourceInternal = sourceNode.type !== 'external';
                        const isTargetInternal = targetNode.type !== 'external';

                        // Logic for Source Node
                        if (isSourceInternal) {
                            if (isTargetInternal) {
                                nodeInternalDegree.set(sourceId, (nodeInternalDegree.get(sourceId) || 0) + 1);
                            } else {
                                nodeExternalDegree.set(sourceId, (nodeExternalDegree.get(sourceId) || 0) + 1);
                            }
                        }

                        // Logic for Target Node
                        if (isTargetInternal) {
                            if (isSourceInternal) {
                                nodeInternalDegree.set(targetId, (nodeInternalDegree.get(targetId) || 0) + 1);
                            } else {
                                nodeExternalDegree.set(targetId, (nodeExternalDegree.get(targetId) || 0) + 1);
                            }
                        }
                    }
                });

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
                    const internalCount = nodeInternalDegree.get(node.id) || 0;
                    const externalCount = nodeExternalDegree.get(node.id) || 0;
                    // Formula: Base 4 + (Internal * 1.5) + (External * 0.75)
                    node.val = 4 + (internalCount * 1.5) + (externalCount * 0.75);
                    node.color = '#00F0FF';
                });

                isForcesApplied.current = false;
                setData({ nodes: internalNodes, links: internalLinks });
            })
            .catch(err => console.error("Failed to load graph data", err));
    }, []);

    // Force Logic
    const applyCustomForces = useCallback(() => {
        if (!fgRef.current || data.nodes.length === 0) return;
        const graph = fgRef.current;
        const CHARGE_STRENGTH = -35;
        const LINK_DISTANCE = 35;

        graph.d3Force('center', null);
        graph.d3Force('charge', null);
        graph.d3Force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH).distanceMax(400));
        graph.d3Force('link').distance(LINK_DISTANCE).strength(0.2);
        graph.d3Force('collide', d3.forceCollide((node: Node) => node.val).strength(0.2));
        graph.d3Force('centerClusterX', d3.forceX(0).strength(0.05));
        graph.d3Force('centerClusterY', d3.forceY(0).strength(0.05));
        graph.d3Force('orphanRadial', null);
    }, [data]);

    useEffect(() => {
        if (isForcesApplied.current) {
            applyCustomForces();
            fgRef.current?.d3ReheatSimulation();
        }
    }, [dimensions, applyCustomForces]);

    const drawLabel = useCallback((node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        const radius = node.val;
        const textY = node.y! + radius + 2 + fontSize;

        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(node.x! - bckgDimensions[0] / 2, textY - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(label, node.x!, textY);
    }, []);

    const nodeCanvasObject = useCallback((node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const radius = node.val;
        const isHovered = node === hoverNode;

        if (node.x === undefined || node.y === undefined) return;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || '#00F0FF';
        ctx.shadowColor = node.color || '#00F0FF';
        ctx.shadowBlur = isHovered ? 25 : 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw label if zoomed in (and NOT hovered, because hovered will be drawn in Post frame)
        // Actually, drawing twice is okay, but skipping prevents overdraw density
        if (!isHovered && globalScale > 2.25) {
            drawLabel(node, ctx, globalScale);
        }
    }, [hoverNode, drawLabel]);

    // Draw hovered node's label LAST to ensure it's on top of everything
    const handleRenderFramePost = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (hoverNode && hoverNode.x !== undefined && hoverNode.y !== undefined) {
            drawLabel(hoverNode, ctx, globalScale);
        }
    }, [hoverNode, drawLabel]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNodeClick = (node: any) => {
        if (node && node.slug) {
            router.push(`/posts/${node.slug}`);
        }
    };

    return (
        <section className="relative flex flex-col my-4 w-full h-full">
            {/* INLINE HERO GRAPH (Visible when NOT maximized) */}
            {!isMaximized && (
                <>
                    <div className="mb-4 space-y-2 md:hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyber-gray pb-2">
                            <div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-cyber-white uppercase tracking-wider mb-1">
                                    <span className="glitch" data-text="NEURAL_NETWORK_MAP">NEURAL_NETWORK_MAP</span>
                                </h2>
                                <p className="text-cyber-gray-light font-mono text-[10px] md:text-xs">
                                    INTERACTIVE SYSTEM VISUALIZATION
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: Show Button instead of Graph */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={toggleMaximize}
                            className="w-full flex items-center justify-center gap-2 py-4 border border-cyber-neon-cyan bg-cyber-black/50 text-cyber-neon-cyan font-display font-bold tracking-widest hover:bg-cyber-neon-cyan/10 transition-colors uppercase relative group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyber-neon-cyan animate-pulse" />
                                INITIATE NEURAL LINK
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                </svg>
                            </span>
                            {/* Scanline hover effect */}
                            <div className="absolute inset-0 bg-cyber-neon-cyan/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>

                    <div
                        className="hidden md:flex flex-col border border-cyber-neon-cyan bg-cyber-black overflow-hidden shadow-lg shadow-cyber-neon-cyan/20 [&_canvas]:!touch-auto w-full h-[600px] relative"
                        ref={containerRef}
                        onTouchStart={handleTouchStart}
                    >
                        <GraphWindowHeader
                            title="NEURAL_NET_v1.0"
                            onMaximize={toggleMaximize}
                            onMinimize={() => { }}
                            onClose={() => { }}
                        />

                        <div className="flex-1 w-full h-full relative cursor-move">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-neon-cyan/5 via-transparent to-transparent opacity-30 pointer-events-none" />
                            <ForceGraph2D
                                ref={fgRef}
                                width={dimensions.width}
                                height={dimensions.height}
                                graphData={data}
                                nodeLabel={() => ""}
                                nodeColor="color"
                                nodeRelSize={6}
                                linkColor={() => 'rgba(92, 92, 92, 1)'}
                                linkWidth={1}
                                backgroundColor="#050505"
                                nodeCanvasObject={(node, ctx, globalScale) => nodeCanvasObject(node as Node, ctx, globalScale)}
                                onNodeHover={(node) => {
                                    setHoverNode(node as Node || null);
                                    document.body.style.cursor = node ? 'pointer' : 'default';
                                }}
                                onRenderFramePost={handleRenderFramePost}
                                onNodeClick={handleNodeClick}
                                onEngineTick={() => {
                                    if (!isForcesApplied.current && fgRef.current) {
                                        applyCustomForces();
                                        isForcesApplied.current = true;
                                    }
                                }}
                                cooldownTicks={100}
                                enableNodeDrag={true}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                enablePanInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                enableZoomInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
                            />
                            {showTutorial && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                    <div className="bg-black/80 backdrop-blur-sm border border-cyber-neon-cyan px-6 py-4 rounded-none text-cyber-neon-cyan font-mono animate-pulse">
                                        USE TWO FINGERS TO PAN/ZOOM
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* MODAL GRAPH (Visible when Maximized) */}
            <Transition appear show={isMaximized} as={Fragment}>
                <Dialog as="div" className="relative z-[1000]" onClose={toggleMaximize}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel
                                    className="w-[90vw] max-w-[1600px] h-[calc(100vh-8rem)] transform overflow-hidden bg-cyber-black border border-cyber-neon-cyan shadow-xl transition-all flex flex-col"
                                >
                                    <GraphWindowHeader
                                        title="NEURAL_NET_MAX"
                                        onMaximize={() => { }}
                                        onMinimize={toggleMaximize}
                                        onClose={toggleMaximize}
                                    />
                                    <div className="flex-1 w-full h-full relative cursor-move bg-black" ref={modalContainerRef}>
                                        <ForceGraph2D
                                            ref={fgRef}
                                            width={modalDimensions.width}
                                            height={modalDimensions.height}
                                            graphData={data} // Reuse same data object
                                            nodeLabel={() => ""}
                                            nodeColor="color"
                                            nodeRelSize={6}
                                            linkColor={() => 'rgba(92, 92, 92, 1)'}
                                            backgroundColor="#050505"
                                            nodeCanvasObject={(node, ctx, globalScale) => nodeCanvasObject(node as Node, ctx, globalScale)}
                                            onNodeHover={(node) => {
                                                setHoverNode(node as Node || null);
                                                document.body.style.cursor = node ? 'pointer' : 'default';
                                            }}
                                            onRenderFramePost={handleRenderFramePost}
                                            onNodeClick={handleNodeClick}
                                            onEngineTick={() => {
                                                if (!isForcesApplied.current && fgRef.current) {
                                                    applyCustomForces();
                                                    isForcesApplied.current = true;
                                                }
                                            }}
                                            cooldownTicks={100}
                                            enableNodeDrag={true}
                                            minZoom={0.5}
                                            maxZoom={4}
                                        />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </section>
    );
}
