
import { getPosts } from '../lib/posts';
import PostsList from '../components/PostsList';

export const metadata = {
  title: "DATA_NODE: ALL_LOGS",
  description: "Accessing all available entries...",
};

export default async function AllPosts() {
  const posts = await getPosts(false); // false means exclude drafts

  return (
    <main className="container mx-auto px-4 py-8">
      <PostsList posts={posts} title="ARCHIVED_LOGS" />
    </main>
  );
}