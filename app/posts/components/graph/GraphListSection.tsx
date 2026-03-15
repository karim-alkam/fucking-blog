'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraphNode } from './types';

interface GraphListSectionProps {
  title: string;
  nodes: GraphNode[];
  colorClass: string; // e.g., 'text-brass border-brass'
  delay: number;
}

export const GraphListSection = ({ title, nodes, colorClass, delay }: GraphListSectionProps) => {
  if (nodes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`border-l pl-5 ${colorClass}`}
    >
      <h3 className="text-xs font-sans font-medium uppercase mb-3 tracking-[0.2em] opacity-80" >
        {title}
      </h3>
      <ul className="space-y-2">
        {nodes.map((node) => (
          <li key={node.id}>
            {node.type === 'post' ? (
              <Link
                href={`/posts/${node.slug}`}
                className="text-[13px] text-starlight/70 hover:text-brass transition-colors block truncate font-sans font-light"
              >
                {node.name}
              </Link>
            ) : (
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-starlight/70 hover:text-celestial-blue-light transition-colors block truncate font-sans font-light"
              >
                {node.name}
              </a>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
