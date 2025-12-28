'use client'

import { useState, useMemo } from 'react';
// import Link from 'next/link'; // Removed unused import
import Pagination from './Pagination';
import { Post } from '../types';
import PostCard from './PostCard';

interface PostsListProps {
  posts: Post[];
  title?: string;
}

export default function PostsList({ posts, title = 'Recent Posts' }: PostsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags from posts
  const allTags = useMemo(() => {
    return Array.from(new Set(posts.flatMap(post => post.tags || []))).sort();
  }, [posts]);

  // Filter posts by selected tag
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
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setCurrentPage(1); // Reset to first page when changing tags
  };

  return (
    <div className='container mx-auto max-w-5xl'>
      <div className="flex flex-col space-y-6 mx-auto mb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {selectedTag ? `Posts tagged with "${selectedTag}"` : title}
          </h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="text-gray-300">Items per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === tag
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {paginatedPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPosts.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
} 