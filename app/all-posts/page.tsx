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
      <Suspense fallback={<div className="text-center py-20 text-starlight/60 font-sans tracking-widest uppercase">Extracting Logs...</div>}>
        <PostsList posts={posts} title="Archived Entries" />
      </Suspense>
    </main>
  );
}