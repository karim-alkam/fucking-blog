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

export default function PostsList({ posts, title = 'Archived Logs' }: PostsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const postsTopRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

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
      <div className="mb-14 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brass/20 pb-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-starlight capitalize tracking-wide mb-3 flex items-center gap-3">
              {selectedTag ? (
                <>Tag Index: <span className="text-brass font-sans text-3xl font-light">#{selectedTag}</span></>
              ) : (
                <span>{title}</span>
              )}
            </h2>
            <p className="text-brass-dark font-sans tracking-widest text-xs uppercase opacity-80">
              {filteredPosts.length} Record{filteredPosts.length !== 1 && 's'} Found
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-6 md:mt-0 self-end">
            <div className="flex items-center space-x-3 bg-void-black/60 backdrop-blur-sm border border-brass/10 px-4 py-2 rounded-sm shadow-sm">
              <label htmlFor="pageSize" className="text-xs text-starlight/60 uppercase font-sans tracking-wider">Density:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-transparent text-brass font-sans text-sm focus:outline-none cursor-pointer font-medium"
              >
                <option value="6" className="bg-deep-space text-starlight">Sparse</option>
                <option value="12" className="bg-deep-space text-starlight">Balanced</option>
                <option value="24" className="bg-deep-space text-starlight">Dense</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 text-xs font-sans uppercase tracking-widest border transition-all duration-300 rounded-sm ${selectedTag === null
              ? 'border-brass text-void-black bg-brass font-semibold shadow-[0_0_15px_rgba(197,168,105,0.2)]'
              : 'border-brass/20 text-starlight/60 hover:border-brass/60 hover:text-brass hover:bg-brass/5'
              }`}
          >
            All Logs
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3.5 py-1.5 text-[11px] font-sans tracking-wide border transition-all duration-300 rounded-sm ${selectedTag === tag
                ? 'border-celestial-blue text-white bg-celestial-blue shadow-[0_0_15px_rgba(75,107,146,0.4)] font-medium'
                : 'border-brass/20 text-brass-dark hover:border-celestial-blue/60 hover:text-celestial-blue hover:bg-celestial-blue/5'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <AnimatePresence mode="popLayout">
          {paginatedPosts.map((post) => (
            <motion.div
              key={post.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-24 glass-panel border border-dashed border-brass/20">
          <svg className="w-12 h-12 text-brass/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="text-2xl font-serif text-starlight/80 italic mb-2">The Archives Yield No Results</h3>
          <p className="text-aged-parchment/60 font-sans font-light tracking-wide">Adjust your astral parameters to seek further.</p>
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