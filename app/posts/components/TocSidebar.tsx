'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface TocHeading {
  level: number;
  text: string;
  id: string;
}

interface TocSidebarProps {
  toc: TocHeading[];
  displayType: 'inline' | 'sidebar'; // 'inline' for mobile top, 'sidebar' for desktop right
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
      rootMargin: '-50% 0px -50% 0px', // Adjust these values to fine-tune when a heading is considered active
      threshold: 0, // We only need to know if it intersects at all
    });

    // Observe all heading elements with IDs
    const elements = document.querySelectorAll('h2[id], h3[id]');
    elements.forEach((el) => observer.current?.observe(el));

    // Clean up the observer
    return () => {
      observer.current?.disconnect();
    };
  }, [toc]);

  const sidebarClasses = displayType === 'sidebar'
    ? "hidden lg:block sticky top-24 h-[calc(100vh-120px)] overflow-y-auto"
    : "lg:hidden mb-8";

  return (
    <div className={sidebarClasses}>
      <div className="bg-cyber-dark-gray border border-cyber-gray p-6 relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-purple"></div>

        <h2 className="text-lg font-display font-bold text-cyber-white mb-4 uppercase tracking-widest flex items-center">
          <span className="w-2 h-2 bg-cyber-neon-cyan mr-2 animate-pulse"></span>
          Table of Contents
        </h2>
        <ul className="space-y-1">
          {toc.map((item) => (
            <li key={item.id} className={`${item.level === 3 ? 'ml-4' : ''}`}>
              <Link
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
                className={`block py-1 text-sm font-mono transition-colors duration-200 border-l-2 pl-3 ${activeId === item.id
                  ? 'border-cyber-neon-yellow text-cyber-neon-yellow'
                  : 'border-transparent text-gray-500 hover:text-cyber-white hover:border-gray-500'
                  }`}
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}