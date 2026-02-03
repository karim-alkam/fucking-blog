'use client';

import React from 'react';

interface GraphWindowHeaderProps {
  title?: string;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const GraphWindowHeader = ({
  title = "NETWORK_GRAPH_v1.0",
  onMaximize,
  onMinimize,
  onClose
}: GraphWindowHeaderProps) => {
  return (
    <div className="h-12 md:h-8 bg-cyber-dark-gray border-b border-cyber-neon-cyan flex items-center justify-between px-4 select-none overflow-hidden shrink-0 z-30 relative">
      <div className="text-sm md:text-xs font-mono text-cyber-gray-light tracking-widest uppercase flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-cyber-neon-pink animate-pulse">►</span>
          <span className="glitch relative text-cyber-neon-cyan" data-text={title}>
            {title}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 relative z-50">
        <div className="flex gap-2">
          {/* Minimize Button */}
          <button
            onClick={onMinimize}
            className="text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group relative w-8 h-8 md:w-3 md:h-3 flex items-center justify-center p-1 md:p-0"
            title="Minimize"
          >
            <div className="absolute inset-0 glitch-controls-1 opacity-70 text-cyber-neon-pink">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 md:w-3 md:h-3"
              >
                <path
                  d="M1 9H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <div className="absolute inset-0 glitch-controls-2 opacity-70 text-cyber-neon-green">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
              >
                <path
                  d="M1 9H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 md:w-3 md:h-3 relative z-10"
            >
              <path
                d="M1 9H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>

          {/* Maximize Button */}
          <button
            onClick={onMaximize}
            className="text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group relative w-8 h-8 md:w-3 md:h-3 flex items-center justify-center p-1 md:p-0"
            title="Maximize"
          >
            <div className="absolute inset-0 glitch-controls-1 opacity-70 text-cyber-neon-pink">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="9"
                  height="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="absolute inset-0 glitch-controls-2 opacity-70 text-cyber-neon-green">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="9"
                  height="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 md:w-3 md:h-3 relative z-10"
            >
              <rect
                x="1.5"
                y="1.5"
                width="9"
                height="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-cyber-neon-cyan hover:text-cyber-neon-pink transition-colors group relative w-8 h-8 md:w-3 md:h-3 flex items-center justify-center p-1 md:p-0"
            title="Close"
          >
            <div className="absolute inset-0 glitch-controls-1 opacity-70 text-cyber-neon-yellow">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
              >
                <path
                  d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <div className="absolute inset-0 glitch-controls-2 opacity-70 text-cyber-neon-blue">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
              >
                <path
                  d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 md:w-3 md:h-3 relative z-10"
            >
              <path
                d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

