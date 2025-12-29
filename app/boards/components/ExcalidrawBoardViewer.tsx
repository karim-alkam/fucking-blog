"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

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

export default function ExcalidrawBoardViewer({ initialData }: { initialData: ExcalidrawInitialDataState | null }) {
  if (!initialData) {
    return (
      <div className="h-[calc(100vh-180px)] w-full max-w-[1200px] mx-auto rounded-lg overflow-hidden flex items-center justify-center bg-gray-800">
        <div className="text-red-500">Failed to load drawing data.</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] w-full max-w-[1200px] mx-auto rounded-lg overflow-hidden">
      <Excalidraw
        theme="dark"
        viewModeEnabled={true}
        initialData={initialData}
      />
    </div>
  );
}