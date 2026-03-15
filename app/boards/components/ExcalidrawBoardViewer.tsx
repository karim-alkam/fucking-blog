"use client";

import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import "./excalidraw-overrides.css";
import type { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';
import LZString from 'lz-string';

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => <ExcalidrawSkeletonLoader />,
  },
);

function ExcalidrawSkeletonLoader() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-deep-space relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brass/20/20 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }}></div>
      <div className="text-celestial-blue font-mono text-lg animate-pulse tracking-widest">
        LOADING_CANVAS...
      </div>
    </div>
  );
}

export default function ExcalidrawBoardViewer({ initialData }: { initialData: ExcalidrawInitialDataState | { compressed: boolean; data: string } | null }) {
  const [data, setData] = useState<ExcalidrawInitialDataState | null>(null);

  useEffect(() => {
    if (!initialData) return;

    // Check if data is compressed (custom type guard)
    if ('compressed' in initialData && initialData.compressed && typeof initialData.data === 'string') {
      try {
        const decompressed = LZString.decompressFromBase64(initialData.data);
        if (decompressed) {
          setData(JSON.parse(decompressed));
        }
      } catch (e) {
        console.error("Failed to decompress drawing", e);
      }
    } else {
      // Fallback or uncompressed
      setData(initialData as ExcalidrawInitialDataState);
    }
  }, [initialData]);


  if (!initialData) {
    return (
      <div className="h-[calc(100vh-180px)] w-full mx-auto overflow-hidden flex items-center justify-center bg-gray-800">
        <div className="text-red-500">Failed to load drawing data.</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[calc(100vh-180px)] w-full mx-auto overflow-hidden">
        <ExcalidrawSkeletonLoader />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] w-full mx-auto flex flex-col border border-celestial-blue bg-void-black relative shadow-lg shadow-celestial-blue/20">
      {/* Decorative Window Header */}
      <div className="h-8 bg-deep-space border-b border-celestial-blue flex items-center justify-between px-4 select-none overflow-hidden">
        <div className="text-xs font-mono text-starlight tracking-widest uppercase flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-brass animate-pulse">►</span>
            <span className="italic relative text-celestial-blue" data-text="SYSTEM_VIEWER_v2.0">SYSTEM_VIEWER_v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {/* Minimize Button */}
            <button className="text-celestial-blue hover:text-brass-dark transition-colors group relative w-3 h-3" title="Minimize">
              <div className="absolute inset-0 italic-controls-1 opacity-70 text-brass">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                  <path d="M1 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </div>
              <div className="absolute inset-0 italic-controls-2 opacity-70 text-brass">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                  <path d="M1 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 relative z-10">
                <path d="M1 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>

            {/* Maximize Button */}
            <button className="text-celestial-blue hover:text-brass-dark transition-colors group relative w-3 h-3" title="Maximize">
              <div className="absolute inset-0 italic-controls-1 opacity-70 text-brass">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                  <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="absolute inset-0 italic-controls-2 opacity-70 text-brass">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                  <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 relative z-10">
                <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Close Button */}
            <button className="text-celestial-blue hover:text-brass transition-colors group relative w-3 h-3" title="Close">
              <div className="absolute inset-0 italic-controls-1 opacity-70 text-brass-dark">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                  <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </div>
              <div className="absolute inset-0 italic-controls-2 opacity-70 text-celestial-blue">
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

      {/* Excalidraw Canvas Container */}
      <div className="flex-1 w-full overflow-hidden relative">
        <Excalidraw
          theme="dark"
          viewModeEnabled={true}
          initialData={data}
        />
      </div>
    </div>
  );
}