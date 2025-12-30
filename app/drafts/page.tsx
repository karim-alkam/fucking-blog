import { getPosts } from '../lib/posts';
import PostsList from '../components/PostsList';
import AnalyticsEvents from '../components/AnalyticsEvents';
import { Post } from '../types';

export default async function DraftsPage() {
  const allPosts = await getPosts(true);
  const draftPosts = allPosts.filter((post: Post) => post.draft === true);

  return (
    <main className="min-h-screen pt-4">
      <AnalyticsEvents eventName="drafts_view" />
      <PostsList posts={draftPosts} title="Draft Logs" />
    </main>
  );
} 