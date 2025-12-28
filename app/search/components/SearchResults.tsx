'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Post } from '../../types';
import PostCard from '../../components/PostCard';

interface SearchResultsProps {
  posts: Post[];
}


function searchPosts(posts: Post[], query: string) {
  if (!query.trim()) return [];

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  // Score each post
  const scoredPosts = posts.map(post => {
    let score = 0;
    const title = post.title.toLowerCase();
    const description = post.description?.toLowerCase() || '';
    const tags = post.tags?.map(tag => tag.toLowerCase()) || [];

    // Check each search term
    searchTerms.forEach(term => {
      // Title matches get highest priority (3 points per term)
      if (title.includes(term)) {
        score += 3;
      }

      // Tag matches get second priority (2 points per term per tag)
      tags.forEach(tag => {
        if (tag.includes(term)) {
          score += 2;
        }
      });

      // Description matches get lowest priority (1 point per term)
      if (description.includes(term)) {
        score += 1;
      }
    });

    return { post, score };
  });

  // Filter out posts with no matches and sort by score
  return scoredPosts
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
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

  // Effect to update filtered posts when the URL search query changes
  useEffect(() => {
    const results = searchPosts(posts, initialSearchQuery); // Use initialSearchQuery from URL
    setFilteredPosts(results);
  }, [initialSearchQuery, posts]); // Depend on initialSearchQuery (from URL)

  // Function to handle search submission
  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    // Use push instead of replace if you want search results to be in browser history
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
          value={searchTerm} // Use local state
          onChange={(e) => {
            setSearchTerm(e.target.value); // Update local state only
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(); // Trigger search on Enter key press
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
        {filteredPosts.length === 0 ? (
          <p className="text-gray-400">No results found for &quot;{searchTerm}&quot;.</p>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))
        )}
      </div>
    </div>
  );
} 