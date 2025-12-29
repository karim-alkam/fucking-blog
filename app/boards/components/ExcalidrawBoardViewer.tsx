"use client";

import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
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
    <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded-lg animate-pulse">
      <div className="text-gray-500 text-lg">
        Loading Excalidraw...
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
      <div className="h-[calc(100vh-180px)] w-full max-w-[1200px] mx-auto rounded-lg overflow-hidden flex items-center justify-center bg-gray-800">
        <div className="text-red-500">Failed to load drawing data.</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[calc(100vh-180px)] w-full max-w-[1200px] mx-auto rounded-lg overflow-hidden">
        <ExcalidrawSkeletonLoader />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] w-full max-w-[1200px] mx-auto rounded-lg overflow-hidden">
      <Excalidraw
        theme="dark"
        viewModeEnabled={true}
        initialData={data}
      />
    </div>
  );
}