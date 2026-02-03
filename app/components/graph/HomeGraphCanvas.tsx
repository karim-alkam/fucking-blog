import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import * as d3 from 'd3-force';
// @ts-expect-error - NProgress missing types
import NProgress from 'nprogress';
import { GraphData, Node, Link } from './types';

interface ForceGraphInstance {
    d3Force(forceName: string, forceFn?: unknown): unknown;
    d3ReheatSimulation(): void;
    zoom(k: number, duration?: number): void;
    centerAt(x: number, y: number, duration?: number): void;
}

// Dynamically import generic ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="h-[60vh] flex items-center justify-center text-cyber-neon-cyan/50 animate-pulse">Initializing Neural Link...</div>
});

interface HomeGraphCanvasProps {
    width: number;
    height: number;
    data: GraphData;
    isForcesApplied: React.MutableRefObject<boolean>;
    onInteract?: () => void;
    onNodeClick?: (node: Node) => void;
}

export function HomeGraphCanvas({ width, height, data, isForcesApplied, onInteract, onNodeClick }: HomeGraphCanvasProps) {
    const router = useRouter();
    const pathname = usePathname();
    const fgRef = useRef<ForceGraphInstance | null>(null);
    const [hoverNode, setHoverNode] = useState<Node | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const startTime = useRef(0);

    // Reset start time on mount OR when data changes (filtering)
    useEffect(() => {
        startTime.current = Date.now();
    }, [data]); // Depend on data to trigger Re-Bloom on filter change

    // Handle Touch Interactions for Mobile UX (Tutorial Only)
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setShowTutorial(true);
            const timer = setTimeout(() => setShowTutorial(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setShowTutorial(false);
        }
        onInteract?.();
    };

    // Force Logic
    const applyCustomForces = useCallback(() => {
        if (!fgRef.current || data.nodes.length === 0) return;
        const graph = fgRef.current;
        const CHARGE_STRENGTH = -25;


        graph.d3Force('center', null);
        graph.d3Force('charge', null);
        graph.d3Force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH).distanceMax(400));
        // Dynamic Link Distance: Scale based on node radii to prevent cramping around large nodes
        // Formula: source_radius + target_radius + 20px padding
        (graph.d3Force('link') as d3.ForceLink<Node, Link>).distance((link: Link) => {
            const source = link.source as Node;
            const target = link.target as Node;
            return (source.val || 5) + (target.val || 5) + 20;
        }).strength(0.3);
        graph.d3Force('collide', d3.forceCollide((node: Node) => node.val).strength(0.05));
        graph.d3Force('centerClusterX', d3.forceX(0).strength(0.05));
        graph.d3Force('centerClusterY', d3.forceY(0).strength(0.05));
        graph.d3Force('orphanRadial', null);
    }, [data.nodes.length]);

    // Callback ref to handle immediate entry (fixing the spread/explosion issue)
    const handleRef = useCallback((instance: ForceGraphInstance | null) => {
        // Save to ref for other usages
        fgRef.current = instance;

        // Initialize animation start time
        if (!startTime.current) {
            startTime.current = Date.now();
        }

        if (instance) {
            // REMOVED manual dampening: Let the physics engine handle the explosion from center naturally for "bloom" effect.

            // Apply our custom forces IMMEDIATELY before the first tick
            applyCustomForces();
            isForcesApplied.current = true;

            // Reheat specifically to start resolving layout from a standstill
            instance.d3ReheatSimulation();
        }
    }, [applyCustomForces, data.nodes, isForcesApplied]);

    useEffect(() => {
        const graph = fgRef.current;
        if (graph) {
            // Update logic for when data changes (filtering) or other prop updates
            if (isForcesApplied.current) {
                applyCustomForces();
                graph.d3ReheatSimulation();
            }
        }
    }, [isForcesApplied, applyCustomForces, data]);

    const drawLabel = useCallback((node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        const radius = node.val;
        const textY = (node.y ?? 0) + radius + 2 + fontSize;

        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect((node.x ?? 0) - bckgDimensions[0] / 2, textY - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(label, (node.x ?? 0), textY);
    }, []);

    const nodeCanvasObject = useCallback((node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const radius = node.val;
        const isHovered = node === hoverNode;

        if (node.x === undefined || node.y === undefined) return;

        // ANIMATION: "Bloom" effect
        // Calculate progress based on time since mount + slight stagger based on node index/val
        // Helper to get animation progress
        const getAnimationProgress = (nodeIndex: number = 0) => {
            const now = Date.now();
            const timeSinceStart = now - startTime.current;
            const animationDuration = 2000;
            const staggerDelay = nodeIndex * 5;
            return Math.min(1, Math.max(0, (timeSinceStart - staggerDelay) / animationDuration));
        };

        const progress = getAnimationProgress(node.index);



        // Easing function (easeOutCubic) for smooth pop
        const easeWithOvershoot = (t: number) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

        // Apply animation
        const animatedRadius = radius * easeWithOvershoot(progress);
        const opacity = easeOutQuart(progress);

        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0, animatedRadius), 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || '#00F0FF';

        // PERFORMANCE OPTIMIZATION:
        // Only render expensive shadow glow for the hovered node.
        // Rendering shadows for all nodes on a large 4k modal canvas kills FPS.
        if (isHovered) {
            ctx.shadowColor = node.color || '#00F0FF';
            ctx.shadowBlur = 25;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1; // Reset alpha for other draws

        if (!isHovered && globalScale > 2.25) {
            drawLabel(node, ctx, globalScale);
        }
    }, [hoverNode, drawLabel]);

    const handleRenderFramePost = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (hoverNode && hoverNode.x !== undefined && hoverNode.y !== undefined) {
            drawLabel(hoverNode, ctx, globalScale);
        }
    }, [hoverNode, drawLabel]);

    const handleNodeClick = (node: Node) => {
        if (!node) return;

        // Manual trigger for loading bar since router.push might be too fast/client-side
        if (node.type === 'post' || node.type === 'board' || node.type === 'drawing' || node.type === 'tag') {
            NProgress.start();
        }

        if (node.type === 'post' && node.slug) {
            router.push(`/posts/${node.slug}`);
        } else if (node.type === 'board') {
            // ID format: "board:BoardName"
            const boardSlug = node.id.replace('board:', '');
            router.push(`/boards/${boardSlug}`);
        } else if (node.type === 'drawing') {
            // ID format: "drawing:BoardName:DrawingName.excalidraw"
            const parts = node.id.split(':');
            if (parts.length >= 3) {
                const boardSlug = parts[1];
                const drawingSlug = parts[2].replace('.excalidraw', '');
                router.push(`/boards/${boardSlug}/${drawingSlug}`);
            }
        } else if (node.type === 'tag') {
            if (pathname === '/') {
                // If on homepage, use custom event to avoid page reload/graph reset
                window.dispatchEvent(new CustomEvent('set-post-tag', { detail: node.name }));
                // Manual scroll as fallback
                const element = document.getElementById('posts-list');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                NProgress.done(); // Stop progress bar immediately as it's instant
            } else {
                // Navigate to home with tag query param and scroll to posts list
                router.push(`/?tag=${encodeURIComponent(node.name)}#posts-list`);
            }
        } else if (node.type === 'external' && node.url) {
            window.open(node.url, '_blank');
        }

        // Notify parent component (e.g. to close modal)
        onNodeClick?.(node);
    };

    return (
        <div className="flex-1 w-full h-full relative cursor-move" onTouchStart={handleTouchStart}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-neon-cyan/5 via-transparent to-transparent opacity-30 pointer-events-none" />
            <ForceGraph2D
                // @ts-expect-error - Library types are incompatible with custom interface
                ref={handleRef}
                width={width}
                height={height}
                graphData={data}
                nodeLabel={() => ""}
                nodeColor="color"
                linkDirectionalParticles={0.5}

                nodeRelSize={6}
                linkColor={() => {
                    // LINK ANIMATION: Fade in links
                    const now = Date.now();
                    const timeSinceStart = now - startTime.current;
                    const animationDuration = 2000;
                    // Start fading in links after 500ms to avoid initial clutter
                    const progress = Math.min(1, Math.max(0, (timeSinceStart - 500) / animationDuration));
                    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
                    const opacity = easeOutQuart(progress);

                    return `rgba(92, 92, 92, ${opacity})`;
                }}
                linkWidth={1}
                backgroundColor="#050505"
                nodeCanvasObject={(node, ctx, globalScale) => nodeCanvasObject(node as Node, ctx, globalScale)}
                onNodeHover={(node) => {
                    setHoverNode(node as Node || null);
                    document.body.style.cursor = node ? 'pointer' : 'default';
                }}
                onRenderFramePost={handleRenderFramePost}
                onNodeClick={(node) => handleNodeClick(node as Node)}
                onEngineTick={() => {
                    if (!isForcesApplied.current && fgRef.current) {
                        applyCustomForces();
                        isForcesApplied.current = true;
                    }
                }}
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.4}
                enableNodeDrag={true}
                enablePanInteraction={(e: MouseEvent | TouchEvent) => e.type !== 'touchstart' || (e as TouchEvent).touches.length >= 2}
                enableZoomInteraction={(e: MouseEvent | TouchEvent) => e.type !== 'touchstart' || (e as TouchEvent).touches.length >= 2}
                minZoom={0.5}
                maxZoom={4}
            />
            {showTutorial && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="bg-black/80 backdrop-blur-sm border border-cyber-neon-cyan px-6 py-4 rounded-none text-cyber-neon-cyan font-mono animate-pulse">
                        USE TWO FINGERS TO PAN/ZOOM
                    </div>
                </div>
            )}
        </div>
    );
}
