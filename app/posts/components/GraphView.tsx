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
    <div className="flex flex-col gap-8">
      
      {/* 1. Interactive Graph Window */}
      <motion.div 
        initial={{ opacity: 0, scaleY: 0.95 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ originY: 0 }}
        className="flex flex-col glass-panel shadow-2xl w-full sm:w-80 lg:w-full mx-auto overflow-hidden bg-void-black/60 rounded-sm"
      >
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
        colorClass="text-brass border-brass/50" 
        delay={0.2} 
      />

      <GraphListSection 
        title="Internal References" 
        nodes={internalReferences} 
        colorClass="text-celestial-blue border-celestial-blue/50" 
        delay={0.3} 
      />

      <GraphListSection 
        title="External Mentions" 
        nodes={externalMentions} 
        colorClass="text-starlight border-starlight/50" 
        delay={0.4} 
      />

    </div>
  );
}
