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

  // State to manage the input field's value
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);

  // Initialize Fuse instance
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

  // Sync local input state with URL query
  useEffect(() => {
    setSearchTerm(initialSearchQuery);
  }, [initialSearchQuery]);

  // Perform search
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
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-cyber-white mb-4 uppercase tracking-widest glitch" data-text="SEARCH DATABASE">
          SEARCH DATABASE
        </h1>
        <p className="text-cyber-neon-cyan font-mono text-sm">
          QUERYING... {posts.length} RECORDS ACCESSIBLE
        </p>
      </div>

      {/* Cyber Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-16 group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-neon-yellow via-cyber-neon-pink to-cyber-neon-cyan opacity-50 blur group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative flex items-center bg-cyber-black items-center">
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
            placeholder="ENTER_KEYWORDS..."
            className="flex-grow p-4 bg-transparent text-cyber-white font-mono text-lg focus:outline-none placeholder-gray-600"
          />
          <button onClick={handleSearchSubmit} className="p-4 text-cyber-gray-light hover:text-cyber-neon-yellow transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {!initialSearchQuery ? (
          <div className="text-center py-12 border border-cyber-gray bg-cyber-dark-gray/30">
            <p className="text-cyber-gray-light font-mono">WAITING FOR INPUT...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-cyber-neon-pink/50 bg-cyber-dark-gray/30">
            <h3 className="text-xl text-cyber-neon-pink font-display mb-2">NO MATCHES FOUND</h3>
            <p className="text-gray-400 font-mono">Query &quot;{initialSearchQuery}&quot; returned 0 results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
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