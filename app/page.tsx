import { Metadata } from 'next';
import Link from 'next/link';
import { getFolderContents } from './lib/posts';
import PostCard from './components/PostCard';
import Hero from './components/Hero';
import { getPosts } from './lib/posts';

export const metadata: Metadata = {
  title: 'HOME',
};

export default async function Home() {
  const allPosts = await getPosts();
  const { subDirs: folders, posts: rootPosts } = await getFolderContents();

  const allTags = Array.from(new Set(
    allPosts.flatMap(post => post.tags || [])
  )).sort();

  return (
    <>
      <Hero tags={allTags} />

      {/* ── Folder & Root-Post Browser ───────────────────────── */}
      <div className="relative z-2 -mt-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">

          {/* Top-level folder cards */}
          {folders.length > 0 && (
            <section className="mb-16">
              <div className="flex items-end justify-between mb-8 border-b border-brass/20 pb-4">
                <h2 className="text-3xl font-serif font-bold text-starlight tracking-wide">
                  Log Directories
                </h2>
                <Link
                  href="/posts"
                  className="text-celestial-blue font-mono text-xs tracking-widest uppercase hover:text-brass transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder: string) => (
                  <Link
                    key={folder}
                    href={`/posts/${encodeURIComponent(folder)}`}
                    className="group block"
                  >
                    <div className="glass-panel p-6 h-full flex flex-col justify-between min-h-[160px] bg-deep-space/50 hover:bg-deep-space transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-celestial-blue font-mono text-xs border border-celestial-blue/30 px-2 py-0.5">DIRECTORY</span>
                          <div className="w-2 h-2 bg-brass-dark rounded-full opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(252,238,10,0.8)] transition-all"></div>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-starlight group-hover:text-celestial-blue transition-colors uppercase truncate">
                          {folder.replace(/-/g, ' ')}
                        </h3>
                      </div>
                      <div className="mt-6 flex items-center justify-end">
                        <span className="text-xs font-mono text-gray-500 group-hover:text-celestial-blue transition-colors">ACCESS &gt;&gt;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Root-level (unfiled) posts */}
          {rootPosts.length > 0 && (
            <section>
              <h2 className="text-3xl font-serif font-bold text-starlight tracking-wide mb-8 border-b border-brass/20 pb-4">
                Unfiled Entries
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {rootPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {folders.length === 0 && rootPosts.length === 0 && (
            <div className="p-8 border border-dashed border-brass/20 text-center text-starlight font-mono">
              NO_CONTENT_DETECTED
            </div>
          )}
        </div>
      </div>
    </>
  );
}
