'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Fuse from 'fuse.js';
import type { Post } from '../../types';
import PostCard from '../../components/PostCard';

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
      threshold: 0.4, // Match sensitivity (0.0 = perfect match, 1.0 = match anything)
      includeScore: true,
      ignoreLocation: true, // Search anywhere in the string
    });
  }, [posts]);

  // Effect to sync local input state with URL query
  // This ensures that when the user searches from the Navbar, the input on the search page updates
  useEffect(() => {
    setSearchTerm(initialSearchQuery);
  }, [initialSearchQuery]);

  // Effect to perform search when query or posts change
  useEffect(() => {
    if (!initialSearchQuery.trim()) {
      setFilteredPosts([]);
      return;
    }

    const results = fuse.search(initialSearchQuery);
    const matches = results.map(result => result.item);
    setFilteredPosts(matches);
  }, [initialSearchQuery, fuse]);

  // Function to handle search submission
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
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Search Results</h1>

      {/* Search Bar */}
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg focus-within:border-blue-500 transition-colors pr-3">
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
          placeholder="Search..."
          className="flex-grow p-2 bg-transparent text-gray-300 focus:outline-none"
        />
        <button onClick={handleSearchSubmit} className="p-1 text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Search Results */}
      <div className="space-y-6 mt-8">
        {!initialSearchQuery ? (
          <p className="text-gray-400">Enter a term to search.</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-gray-400">No results found for &quot;{initialSearchQuery}&quot;.</p>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))
        )}
      </div>
    </div>
  );
}