import { getPosts } from '../lib/posts';
import PostsList from '../components/PostsList';
import { Post } from '../types';

export default async function DraftsPage() {
  const allPosts = await getPosts(true);
  const draftPosts = allPosts.filter((post: Post) => post.draft === true);

  return (
    <main className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <PostsList posts={draftPosts} title="Draft Posts" />
      </div>
    </main>
  );
} 