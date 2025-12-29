import { Suspense } from 'react';
import { getPosts } from '../lib/posts';
import SearchResults from './components/SearchResults';

export default async function SearchPage() {
  const allPosts = await getPosts(false); // Fetch only published posts

  return (
    <main>
      <div className="container mx-auto px-4 py-8">

        <Suspense fallback={<div className="text-gray-300">Loading search results...</div>}>
          <SearchResults posts={allPosts} />
        </Suspense>
      </div>
    </main>
  );
} 