'use client';

import React from 'react';

interface GraphWindowHeaderProps {
  title?: string;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const GraphWindowHeader = ({
  title = "Constellation Map",
  onMaximize,
  onMinimize,
  onClose
}: GraphWindowHeaderProps) => {
  return (
    <div className="h-10 md:h-10 bg-void-black border-b border-brass/20 flex items-center justify-between px-5 select-none overflow-hidden shrink-0 z-30 relative shadow-inner">
      <div className="text-sm md:text-xs font-sans text-brass tracking-[0.2em] uppercase flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brass/60"></span>
          <span className="font-medium text-starlight/80 italic">
            {title}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-50">
          {/* Subtle Window Controls */}
          <button
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-void-black border border-brass/40 hover:bg-brass/20 transition-colors"
            title="Minimize"
          />
          <button
            onClick={onMaximize}
            className="w-3 h-3 rounded-full bg-void-black border border-celestial-blue/40 hover:bg-celestial-blue/20 transition-colors"
            title="Maximize"
          />
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-void-black border border-red-900/40 hover:bg-red-900/20 transition-colors"
            title="Close"
          />
      </div>
    </div>
  );
};
