import { getPosts } from '../lib/posts';
import PostsList from '../components/PostsList';
import { Post } from '../types';

export default async function DraftsPage() {
  const allPosts = await getPosts(true);
  const draftPosts = allPosts.filter((post: Post) => post.draft === true);

  return (
    <main className="min-h-screen pt-4">
      <PostsList posts={draftPosts} title="Draft Logs" />
    </main>
  );
} 