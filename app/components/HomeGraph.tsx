"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { GraphWindowHeader } from '../posts/components/graph/GraphWindowHeader';
import { useHomeGraphData } from './graph/useHomeGraphData';
import { HomeGraphCanvas } from './graph/HomeGraphCanvas';
import { GraphModal } from './graph/GraphModal';

export default function HomeGraph() {
    const { data, isForcesApplied } = useHomeGraphData();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    // Toggle Maximize
    const toggleMaximize = useCallback(() => {
        setIsMaximized(prev => !prev);
        // Reset forces flag because a NEW graph instance will be mounted in the modal
        // This ensures applyCustomForces() is called again for the new instance.
        isForcesApplied.current = false;
    }, [isForcesApplied]);

    // Resize handler for Inline Graph
    const handleResize = useCallback(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight - 32 // Minus header height
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
                    >
                        <GraphWindowHeader
                            title="NEURAL_NET_v1.0"
                            onMaximize={toggleMaximize}
                            onMinimize={() => { }}
                            onClose={() => { }}
                        />

                        <HomeGraphCanvas
                            width={dimensions.width}
                            height={dimensions.height}
                            data={data}
                            isForcesApplied={isForcesApplied}
                            onInteract={toggleMaximize} // Pass interaction handler if needed, mainly for mobile touch
                        />
                    </div>
                </>
            )}

            {/* MODAL GRAPH (Visible when Maximized) */}
            <GraphModal
                isOpen={isMaximized}
                onClose={toggleMaximize}
                data={data}
                isForcesApplied={isForcesApplied}
            />
        </section>
    );
}
