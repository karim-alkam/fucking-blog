import { Metadata } from 'next';
import { getPosts } from './lib/posts';
import PostsList from './components/PostsList';
import Hero from './components/Hero';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'HOME',
};

export default async function Home() {
  const allPosts = await getPosts();

  // Get unique tags from all posts
  const allTags = Array.from(new Set(
    allPosts.flatMap(post => post.tags || [])
  )).sort();

  return (
    <>
      <Hero tags={allTags} />
      <div className="relative z-2 -mt-10">
        <Suspense fallback={<div className="text-center py-20 text-starlight/60 font-sans tracking-widest uppercase">Consulting Archives...</div>}>
          <PostsList posts={allPosts} title="Recent Entries" />
        </Suspense>
      </div>
    </>
  );
}
