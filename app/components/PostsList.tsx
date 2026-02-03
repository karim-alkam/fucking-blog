'use client'

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from './Pagination';
import { Post } from '../types';
import PostCard from './PostCard';
import { motion, AnimatePresence } from 'framer-motion';

interface PostsListProps {
  posts: Post[];
  title?: string;
}

export default function PostsList({ posts, title = 'Recent Logs' }: PostsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const postsTopRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Sync with URL query params
  // Sync with URL query params & Custom Events
  useEffect(() => {
    // 1. Handle URL Params (Initial Load / Back Button)
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }

    // 2. Handle Custom Event (Graph Interaction - No Reload)
    const handleSetTag = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newTag = customEvent.detail;
      setSelectedTag(newTag);

      // Update URL silently without Next.js Router navigation (to preserve Graph state)
      const newUrl = new URL(window.location.href);
      if (newTag) {
        newUrl.searchParams.set('tag', newTag);
      } else {
        newUrl.searchParams.delete('tag');
      }
      window.history.pushState({}, '', newUrl.toString());
    };

    window.addEventListener('set-post-tag', handleSetTag);
    return () => window.removeEventListener('set-post-tag', handleSetTag);
  }, [searchParams]);

  const allTags = useMemo(() => {
    return Array.from(new Set(posts.flatMap(post => post.tags || []))).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPosts.length / pageSize);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setCurrentPage(1);
  };

  return (
    <div id="posts-list" className='container mx-auto max-w-7xl px-4 py-8' ref={postsTopRef}>
      {/* Header and Filter Controls */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyber-gray pb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-cyber-white uppercase tracking-wider mb-2">
              {selectedTag ? (
                <span>Tag: <span className="text-cyber-neon-pink">#{selectedTag}</span></span>
              ) : (
                <span className="glitch" data-text={title}>{title}</span>
              )}
            </h2>
            <p className="text-cyber-gray-light font-mono text-sm">
              {filteredPosts.length} ENTRY(S) FOUND
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0 self-end">
            <div className="flex items-center space-x-2 bg-cyber-dark-gray border border-cyber-gray px-3 py-1">
              <label htmlFor="pageSize" className="text-xs text-cyber-gray-light uppercase font-mono">DENSITY:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-transparent text-cyber-neon-cyan font-mono text-sm focus:outline-none cursor-pointer"
              >
                <option value="6" className="bg-cyber-dark-gray text-cyber-neon-cyan">LOW</option>
                <option value="12" className="bg-cyber-dark-gray text-cyber-neon-cyan">MED</option>
                <option value="24" className="bg-cyber-dark-gray text-cyber-neon-cyan">HIGH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-all ${selectedTag === null
              ? 'border-cyber-neon-yellow text-cyber-black bg-cyber-neon-yellow'
              : 'border-cyber-gray text-cyber-gray-light hover:border-cyber-neon-yellow hover:text-cyber-neon-yellow'
              }`}
          >
            ALL_SYSTEMS
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-all ${selectedTag === tag
                ? 'border-cyber-neon-cyan text-cyber-black bg-cyber-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'border-cyber-gray text-cyber-gray-light hover:border-cyber-neon-cyan hover:text-cyber-neon-cyan'
                }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <AnimatePresence mode="popLayout">
          {paginatedPosts.map((post) => (
            <motion.div
              key={post.slug}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 border border-dashed border-cyber-gray">
          <h3 className="text-2xl font-display text-cyber-gray-light">NO DATA FOUND</h3>
          <p className="text-gray-500 font-mono mt-2">Try adjusting your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
    postsTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
}