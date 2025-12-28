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
  }, [toc]); // Re-observe if toc changes (though it shouldn't on a static post page)

  const sidebarClasses = displayType === 'sidebar'
    ? "hidden lg:block sticky top-8 h-[calc(100vh-80px)] overflow-y-auto lg:col-span-1"
    : "lg:hidden mb-8"; // Classes for mobile inline display - Removed padding

  return (
    <div className={sidebarClasses}>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
        <ul>
          {toc.map((item) => (
            <li key={item.id} className={`mb-2 ${item.level === 3 ? 'ml-4' : ''}`}>
              <Link
                href={`#${item.id}`}
                className={`text-blue-400 hover:underline transition-colors ${activeId === item.id ? 'font-bold text-white' : ''}`}
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