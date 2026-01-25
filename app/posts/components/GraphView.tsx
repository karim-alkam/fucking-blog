'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-cyber-dark-gray animate-pulse rounded-lg border border-cyber-gray"></div>
});

interface GraphNode {
  id: string;
  name: string;
  val: number;
  type: 'post' | 'external';
  slug?: string;
  url?: string;
  color?: string;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'internal' | 'external';
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphViewProps {
  currentSlug: string;
}

export default function GraphView({ currentSlug }: GraphViewProps) {
  const [data, setData] = useState<GraphData | null>(null);
  const router = useRouter();
  const graphWrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0); // Start at 0 to defer render until measured

  // Filter Graph Data for Local View
  const filteredData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    // 1. Find the current node
    const currentNode = data.nodes.find(n => n.slug === currentSlug);
    if (!currentNode) return { nodes: [], links: [] };

    // 2. Find neighbors (Level 1)
    const neighborIds = new Set<string>();
    const relevantLinks: GraphLink[] = [];
    
    // Add current node ID
    neighborIds.add(currentNode.id);

    data.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;

        if (sourceId === currentNode.id) {
            neighborIds.add(targetId as string);
            relevantLinks.push(link);
        } else if (targetId === currentNode.id) {
            neighborIds.add(sourceId as string);
            relevantLinks.push(link);
        }
    });

    // 3. Filter nodes
    const relevantNodes = data.nodes.filter(n => neighborIds.has(n.id)).map(n => ({
        ...n,
        // Color logic: Current = Pink, Post = Green, External = Cyan (Blue)
        color: n.id === currentNode.id ? '#FF003C' : (n.type === 'post' ? '#39FF14' : '#00F0FF')
    }));

    return { nodes: relevantNodes, links: relevantLinks };
  }, [data, currentSlug]);

  // Derived Lists
  const internalLinks = filteredData.links.filter(l => {
     const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
     return sourceId === currentSlug;
  }).map(l => {
      const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return filteredData.nodes.find(n => n.id === targetId)!; // Assert non-null because we filtered nodes earlier
  }).filter(Boolean);

  const backlinks = filteredData.links.filter(l => {
      const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return targetId === currentSlug;
   }).map(l => {
       const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
       return filteredData.nodes.find(n => n.id === sourceId)!; // Assert non-null
   }).filter(Boolean);


  useEffect(() => {
    fetch('/graph-data.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Failed to load graph data", err));
  }, []);

  useEffect(() => {
    if (!data || !graphWrapperRef.current) return;

    const measure = () => {
      if (graphWrapperRef.current) {
        const w = graphWrapperRef.current.clientWidth;
        if (w > 0) {
          setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
        }
      }
    };

    // Initial measure
    measure();

    // Observer
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(graphWrapperRef.current);

    // Polling backup for mobile animations/layout shifts
    const timers: NodeJS.Timeout[] = [];
    [100, 300, 500, 800, 1500].forEach(delay => {
        timers.push(setTimeout(measure, delay));
    });

    // Window resize backup
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', measure);
    };
  }, [data]);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Interactive Graph */}
      <motion.div 
        initial={{ opacity: 0, scaleY: 0, filter: 'brightness(2) hue-rotate(90deg)' }}
        animate={{ opacity: 1, scaleY: 1, filter: 'brightness(1) hue-rotate(0deg)' }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        style={{ originY: 0 }}
        className="flex flex-col border border-cyber-neon-cyan bg-cyber-black relative shadow-lg shadow-cyber-neon-cyan/20 w-full sm:w-80 lg:w-full mx-auto overflow-hidden"
      >
        
        {/* Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.05)_50%)] bg-[length:100%_4px] opacity-50"></div>
        <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute left-0 right-0 h-[2px] bg-cyber-neon-cyan/30 z-20 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
        />

        {/* Decorative Window Header */}
        <div className="h-8 bg-cyber-dark-gray border-b border-cyber-neon-cyan flex items-center justify-between px-4 select-none overflow-hidden">
            <div className="text-xs font-mono text-cyber-gray-light tracking-widest uppercase flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-cyber-neon-pink animate-pulse">►</span>
                <span className="glitch relative text-cyber-neon-cyan" data-text="NETWORK_GRAPH_v1.0">NETWORK_GRAPH_v1.0</span>
            </div>
            </div>
            <div className="flex items-center gap-3">
            <div className="flex gap-2">
                {/* Minimize Button */}
                <button className="text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group relative w-3 h-3" title="Minimize">
                <div className="absolute inset-0 glitch-controls-1 opacity-70 text-cyber-neon-pink">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <path d="M1 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                </div>
                <div className="absolute inset-0 glitch-controls-2 opacity-70 text-cyber-neon-green">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <path d="M1 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 relative z-10">
                    <path d="M1 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
                </button>

                {/* Maximize Button */}
                <button className="text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group relative w-3 h-3" title="Maximize">
                <div className="absolute inset-0 glitch-controls-1 opacity-70 text-cyber-neon-pink">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </div>
                <div className="absolute inset-0 glitch-controls-2 opacity-70 text-cyber-neon-green">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 relative z-10">
                    <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                </button>

                {/* Close Button */}
                <button className="text-cyber-neon-cyan hover:text-cyber-neon-pink transition-colors group relative w-3 h-3" title="Close">
                <div className="absolute inset-0 glitch-controls-1 opacity-70 text-cyber-neon-yellow">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                </div>
                <div className="absolute inset-0 glitch-controls-2 opacity-70 text-cyber-neon-blue">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 relative z-10">
                    <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
                </button>
            </div>
            </div>
        </div>

        <div className="flex-1 w-full overflow-hidden relative h-64" ref={graphWrapperRef}>
            {width > 0 ? (
                <ForceGraph2D
                key={currentSlug} // Force re-mount on navigation to ensure clean state
                width={width}
                height={256}
                graphData={filteredData}
                nodeLabel="name"
                nodeRelSize={6}
                linkColor={() => '#2a2a2a'}
                backgroundColor="rgba(0,0,0,0)"
                onNodeClick={(node) => {
                    if (node.type === 'post' && node.slug) {
                        router.push(`/posts/${node.slug}`);
                    } else if (node.type === 'external' && node.url) {
                        window.open(node.url, '_blank');
                    }
                }}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12/globalScale;
                    ctx.font = `${fontSize}px "Rajdhani", sans-serif`;

                    // Draw Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x!, node.y!, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color || '#fff';
                    ctx.fill();
                    
                    // Glow effect
                    ctx.shadowColor = node.color || '#fff';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0; // Reset

                    // Draw Label on Hover or if it's the current node
                    // Note: Simplification for performance, drawing text below node
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color || '#fff';
                    ctx.fillText(label, node.x!, node.y! + 8);
                }}
                />
            ) : (
                <div className="flex items-center justify-center h-full w-full">
                    <div className="text-cyber-neon-cyan/50 text-xs font-mono animate-pulse">
                        INITIALIZING_SYSTEM...
                    </div>
                </div>
            )}
        </div>
      </motion.div>

      {/* 2. Links Section */}
      {internalLinks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="border-l-2 border-cyber-neon-cyan pl-4"
          >
              <h3 className="text-sm font-display font-bold text-cyber-neon-cyan uppercase mb-2 tracking-widest">
                  Mentions
              </h3>
              <ul className="space-y-1">
                  {internalLinks.map((node) => (
                      <li key={node.id}>
                          {node.type === 'post' ? (
                              <Link href={`/posts/${node.slug}`} className="text-xs text-gray-400 hover:text-cyber-neon-green transition-colors block truncate font-mono">
                                  [[ {node.name} ]]
                              </Link>
                          ) : (
                             <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-cyber-neon-cyan transition-colors block truncate font-mono">
                                 [EXT] {node.name}
                             </a>
                          )}
                      </li>
                  ))}
              </ul>
          </motion.div>
      )}

      {/* 3. Backlinks Section */}
      {backlinks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="border-l-2 border-cyber-neon-green pl-4"
          >
              <h3 className="text-sm font-display font-bold text-cyber-neon-green uppercase mb-2 tracking-widest">
                  Referenced By
              </h3>
              <ul className="space-y-1">
                  {backlinks.map((node) => (
                      <li key={node.id}>
                          <Link href={`/posts/${node.slug}`} className="text-xs text-gray-400 hover:text-cyber-white transition-colors block truncate font-mono">
                               [[ {node.name} ]]
                          </Link>
                      </li>
                  ))}
              </ul>
          </motion.div>
      )}

    </div>
  );
}
