'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TocHeading {
  level: number;
  text: string;
  id: string;
}

interface TocSidebarProps {
  toc: TocHeading[];
  displayType: 'inline' | 'sidebar';
}

export default function TocSidebar({ toc, displayType }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0,
    });

    const elements = document.querySelectorAll('h2[id], h3[id]');
    elements.forEach((el) => observer.current?.observe(el));

    return () => {
      observer.current?.disconnect();
    };
  }, [toc]);

  const sidebarClasses = displayType === 'sidebar'
    ? "hidden lg:block max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 text-sm"
    : "lg:hidden mb-12 border-t border-b border-brass/10 py-6";

  return (
    <div className={sidebarClasses}>
      <motion.div 
        initial={{ opacity: 0, scaleY: 0.95 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ originY: 0 }}
        className={displayType === 'sidebar' ? "glass-panel p-6 bg-void-black/30" : "relative"}
      >

        <h2 className="text-sm font-sans font-medium text-brass mb-5 uppercase tracking-[0.2em] flex items-center relative z-10 border-b border-brass/20 pb-3">
          Index
        </h2>
        <ul className="space-y-3 relative z-10 font-sans font-light">
          {toc.map((item) => (
            <li key={item.id} className={`${item.level === 3 ? 'ml-5' : ''}`}>
              <Link
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
                className={`block transition-colors duration-300 border-l px-3 py-0.5 ${activeId === item.id
                  ? 'border-brass text-brass font-medium bg-brass/5'
                  : 'border-brass/10 text-starlight/50 hover:text-starlight hover:border-brass/50'
                  }`}
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}