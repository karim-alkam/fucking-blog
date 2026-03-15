import { getPosts } from '../lib/posts';
import PostsList from '../components/PostsList';
import AnalyticsEvents from '../components/AnalyticsEvents';
import { Post } from '../types';
import { Suspense } from 'react';

export default async function DraftsPage() {
  const allPosts = await getPosts(true);
  const draftPosts = allPosts.filter((post: Post) => post.draft === true);

  return (
    <main className="min-h-screen pt-4">
      <AnalyticsEvents eventName="drafts_view" />
      <Suspense fallback={<div className="text-center py-20 text-celestial-blue font-mono">LOADING_DATA...</div>}>
        <PostsList posts={draftPosts} title="Draft Logs" />
      </Suspense>
    </main>
  );
} 