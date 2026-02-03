'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraphData } from './types';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-cyber-dark-gray animate-pulse rounded-lg border border-cyber-gray"></div>
});

interface GraphCanvasProps {
  data: GraphData;
  currentSlug: string; // Used for unique key re-mounting
  showExternal: boolean;
  setShowExternal: (show: boolean) => void;
}

export const GraphCanvas = ({ data, currentSlug, showExternal, setShowExternal }: GraphCanvasProps) => {
  const router = useRouter();
  const graphWrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const startTime = useRef(0);

  // Reset start time on mount OR when data changes (filtering)
  useEffect(() => {
    startTime.current = Date.now();
  }, [data]);

  // Resize Observer
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

  return (
    <div
      className="flex-1 w-full overflow-hidden relative h-64 [&_canvas]:!touch-auto"
      ref={graphWrapperRef}
      onTouchStart={handleTouchStart}
    >
      {/* Controls Overlay */}
      <div className="absolute bottom-3 right-3 z-10">
        <button
          onClick={() => setShowExternal(!showExternal)}
          className={`text-[10px] font-mono uppercase tracking-wider border px-2 py-1 transition-all backdrop-blur-sm ${showExternal
            ? 'border-cyber-neon-cyan text-cyber-neon-cyan bg-cyber-neon-cyan/10 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
            : 'border-cyber-gray text-cyber-gray-light bg-cyber-black/50 hover:text-cyber-white hover:border-cyber-white'
            }`}
          title={showExternal ? "Hide External Links" : "Show External Links"}
        >
          {showExternal ? '[ EXT: ON ]' : '[ EXT: OFF ]'}
        </button>
      </div>

      {width > 0 ? (
        <ForceGraph2D
          key={`${currentSlug}-${showExternal}`} // Force re-mount on toggle to reset physics engine
          width={width}
          height={256}
          graphData={data}
          nodeLabel="name"
          nodeRelSize={6}
          linkDirectionalParticles={0.5}
          // Custom interaction filter: Ignore 1-finger touch to allow scrolling
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enablePanInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enableZoomInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
          linkColor={() => {
            const now = Date.now();
            const timeSinceStart = now - startTime.current;
            const animationDuration = 2000;
            const progress = Math.min(1, Math.max(0, (timeSinceStart - 500) / animationDuration));
            const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
            const opacity = easeOutQuart(progress);
            return `rgba(92, 92, 92, ${opacity})`;
          }}
          backgroundColor="rgba(0,0,0,0)"
          onNodeClick={(node) => {
            if (node.type === 'post' && node.slug) {
              router.push(`/posts/${node.slug}`);
            } else if (node.type === 'external' && node.url) {
              window.open(node.url, '_blank');
            }
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const radius = 5;
            const label = node.name;

            if (node.x === undefined || node.y === undefined) return;

            const now = Date.now();
            const timeSinceStart = now - startTime.current;
            const animationDuration = 2000;
            const progress = Math.min(1, Math.max(0, timeSinceStart / animationDuration));

            const easeWithOvershoot = (t: number) => {
              const c1 = 1.70158;
              const c3 = c1 + 1;
              return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            };
            const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

            const animatedRadius = radius * easeWithOvershoot(progress);
            const opacity = easeOutQuart(progress);

            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(node.x, node.y, Math.max(0, animatedRadius), 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || '#fff';

            ctx.shadowColor = node.color || '#fff';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px "Rajdhani", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color || '#fff';
            ctx.fillText(label, node.x, node.y + radius + 2 + fontSize);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-cyber-neon-cyan/50 text-xs font-mono animate-pulse">
            INITIALIZING_SYSTEM...
          </div>
        </div>
      )}

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
  );
};
