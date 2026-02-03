import { getPosts } from '../lib/posts';
import PostsList from '../components/PostsList';
import { Suspense } from 'react';

export const metadata = {
  title: "ARCHIVES",
  description: "Accessing all available entries...",
};

export default async function AllPosts() {
  const posts = await getPosts(false); // false means exclude drafts

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center py-20 text-cyber-neon-cyan font-mono">LOADING_DATA...</div>}>
        <PostsList posts={posts} title="ARCHIVED_LOGS" />
      </Suspense>
    </main>
  );
}