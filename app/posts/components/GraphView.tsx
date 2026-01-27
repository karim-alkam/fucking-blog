'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGraphData } from './graph/useGraphData';
import { GraphWindowHeader } from './graph/GraphWindowHeader';
import { GraphCanvas } from './graph/GraphCanvas';
import { GraphListSection } from './graph/GraphListSection';

interface GraphViewProps {
  currentSlug: string;
}

export default function GraphView({ currentSlug }: GraphViewProps) {
  const {
    data,
    filteredData,
    showExternal,
    setShowExternal,
    internalMentions,
    externalMentions,
    internalReferences
  } = useGraphData(currentSlug);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Interactive Graph Window */}
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

        <GraphWindowHeader />
        
        <GraphCanvas 
            data={filteredData} 
            currentSlug={currentSlug}
            showExternal={showExternal} 
            setShowExternal={setShowExternal} 
        />
      </motion.div>

      {/* 2. Link Lists */}
      <GraphListSection 
        title="Internal Mentions" 
        nodes={internalMentions} 
        colorClass="cyber-neon-green" 
        delay={0.4} 
      />

      <GraphListSection 
        title="Internal References" 
        nodes={internalReferences} 
        colorClass="cyber-neon-yellow" 
        delay={0.5} 
      />

      <GraphListSection 
        title="External Mentions" 
        nodes={externalMentions} 
        colorClass="cyber-neon-cyan" 
        delay={0.6} 
      />

    </div>
  );
}
