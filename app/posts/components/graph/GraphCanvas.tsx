'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraphData } from './types';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-void-black animate-pulse rounded-b-sm border-t border-brass/10 border-b border-brass/10"></div>
});

interface GraphCanvasProps {
  data: GraphData;
  currentSlug: string; 
  showExternal: boolean;
  setShowExternal: (show: boolean) => void;
}

export const GraphCanvas = ({ data, currentSlug, showExternal, setShowExternal }: GraphCanvasProps) => {
  const router = useRouter();
  const graphWrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const startTime = useRef(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, [data]);

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

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(graphWrapperRef.current);

    const timers: NodeJS.Timeout[] = [];
    [100, 300, 500, 800, 1500].forEach(delay => {
      timers.push(setTimeout(measure, delay));
    });

    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', measure);
    };
  }, [data]);

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
      className="flex-1 w-full overflow-hidden relative h-64 [&_canvas]:!touch-auto bg-deep-space"
      ref={graphWrapperRef}
      onTouchStart={handleTouchStart}
    >
      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowExternal(!showExternal)}
          className={`text-[10px] font-sans uppercase tracking-[0.2em] border px-3 py-1.5 transition-all backdrop-blur-sm rounded-sm ${showExternal
            ? 'border-brass text-void-black bg-brass shadow-[0_0_15px_rgba(197,168,105,0.2)]'
            : 'border-brass/30 text-brass/70 bg-void-black/50 hover:text-brass hover:border-brass/60'
            }`}
          title={showExternal ? "Hide External Links" : "Show External Links"}
        >
          {showExternal ? 'External: Visible' : 'External: Hidden'}
        </button>
      </div>

      {width > 0 ? (
        <ForceGraph2D
          key={`${currentSlug}-${showExternal}`} 
          width={width}
          height={256}
          graphData={data}
          nodeLabel="name"
          nodeRelSize={6}
          linkDirectionalParticles={0} // Removed directional particles for cleaner look
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enablePanInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enableZoomInteraction={(e: any) => e.type !== 'touchstart' || e.touches.length >= 2}
          linkColor={() => `rgba(197, 168, 105, 0.15)`} // Elegant brass link color
          backgroundColor="transparent"
          onNodeClick={(node) => {
            if (node.type === 'post' && node.slug) {
              router.push(`/posts/${node.slug}`);
            } else if (node.type === 'external' && node.url) {
              window.open(node.url, '_blank');
            }
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const radius = 4;
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

            // Using brass, celestial-blue, or starlight for nodes depending on type
            let color = '#EAE7DC'; // Starlight
            if (node.type === 'post') {
              color = node.slug === currentSlug ? '#C5A869' : '#8E7B4A'; // Brass / Brass Dark
            } else if (node.type === 'external') {
              color = '#4B6B92'; // Celestial Blue
            }

            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(node.x, node.y, Math.max(0, animatedRadius), 0, 2 * Math.PI, false);
            ctx.fillStyle = color;

            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            const fontSize = 10 / globalScale;
            ctx.font = `300 ${fontSize}px "Outfit", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            ctx.fillText(label, node.x, node.y + radius + 3 + fontSize);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-starlight/40 text-xs font-sans tracking-[0.2em] font-light uppercase animate-pulse">
            Calibrating Instruments...
          </div>
        </div>
      )}

      {/* Mobile Tutorial Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showTutorial ? 1 : 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-void-black/80 pointer-events-none"
      >
        <div className="text-brass font-sans text-xs uppercase tracking-[0.2em] font-light bg-void-black/90 border border-brass/20 px-6 py-3 rounded-sm shadow-xl">
          Use two fingers to navigate
        </div>
      </motion.div>
    </div>
  );
};
