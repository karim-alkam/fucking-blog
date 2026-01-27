'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraphNode } from './types';

interface GraphListSectionProps {
  title: string;
  nodes: GraphNode[];
  colorClass: string; // e.g., 'text-cyber-neon-green', 'border-cyber-neon-green'
  delay: number;
}

export const GraphListSection = ({ title, nodes, colorClass, delay }: GraphListSectionProps) => {
  if (nodes.length === 0) return null;

  // Map utility class names based on the base color class passed
  // We assume colorClass is like 'cyber-neon-green'
  const borderColor = `border-${colorClass}`;
  const textColor = `text-${colorClass}`;
  const hoverColor = `hover:text-${colorClass}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`border-l-2 ${borderColor} pl-4`}
    >
      <h3 className={`text-sm font-display font-bold ${textColor} uppercase mb-2 tracking-widest`} >
        {title}
      </h3>
      <ul className="space-y-1">
        {nodes.map((node) => (
          <li key={node.id}>
            {node.type === 'post' ? (
              <Link
                href={`/posts/${node.slug}`}
                className={`text-xs text-gray-400 ${hoverColor} transition-colors block truncate font-mono`}
              >
                {node.name}
              </Link>
            ) : (
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs text-gray-400 ${hoverColor} transition-colors block truncate font-mono`}
              >
                [EXT] {node.name}
              </a>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
