'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Fuse from 'fuse.js';
import type { Post } from '../../types';
import PostCard from '../../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResultsProps {
  posts: Post[];
}

export default function SearchResults({ posts }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearchQuery = searchParams.get('q') || '';
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);

  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'tags', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.2,
      minMatchCharLength: 2,
      includeScore: true,
      ignoreLocation: true,
    });
  }, [posts]);

  useEffect(() => {
    setSearchTerm(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    if (!initialSearchQuery.trim()) {
      setFilteredPosts([]);
      return;
    }

    const results = fuse.search(initialSearchQuery);
    const matches = results.map(result => result.item);
    setFilteredPosts(matches);
  }, [initialSearchQuery, fuse]);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-starlight mb-6 tracking-wide relative inline-block">
          Database Query
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-[1px] bg-brass/40"></div>
        </h1>
        <p className="text-brass font-sans text-xs uppercase tracking-[0.3em] font-medium mt-8">
          {posts.length} entries cataloged
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-20 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-brass/10 to-transparent blur-md group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative flex items-center glass-panel bg-void-black/70 shadow-2xl rounded-sm overflow-hidden">
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            placeholder="Search records..."
            className="flex-grow p-5 bg-transparent text-starlight font-sans font-light text-xl focus:outline-none placeholder-starlight/30"
          />
          <button onClick={handleSearchSubmit} className="p-6 text-starlight/40 hover:text-brass transition-colors bg-deep-space/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {!initialSearchQuery ? (
          <div className="text-center py-20 glass-panel bg-void-black/30 border-brass/10">
            <p className="text-starlight/50 font-serif italic text-xl">Awaiting query parameters...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 glass-panel bg-void-black/30 border border-brass/20">
            <h3 className="text-2xl text-starlight font-serif italic mb-3">No matching records found.</h3>
            <p className="text-starlight/50 font-sans font-light text-sm">Query &quot;{initialSearchQuery}&quot; returned 0 results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full"
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}