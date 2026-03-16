import Link from 'next/link';
import { getFolderContents } from '../lib/posts';
import PostCard from '../components/PostCard';

export const metadata = {
  title: "LOG_DIRECTORIES",
};

export default async function PostsPage() {
  const { subDirs, posts } = await getFolderContents();
  const folders = subDirs;
  const rootPosts = posts;
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col mb-12 border-b border-brass/20 pb-4">
        <h1 className="text-4xl font-serif font-bold text-starlight uppercase tracking-wider">
          Log Directories
        </h1>
        <p className="text-starlight font-mono text-sm mt-1">Select a folder or unfiled log entry</p>
      </div>

      {folders.length === 0 && rootPosts.length === 0 ? (
        <div className="p-8 border border-dashed border-brass/20 text-center text-starlight font-mono">
          NO_CONTENT_DETECTED
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {folders.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif font-bold text-starlight/80 tracking-wider mb-6 border-l-4 border-brass pl-4">DIRECTORIES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder: string) => (
                  <Link
                    key={folder}
                    href={`/posts/${encodeURIComponent(folder)}`}
                    className="group block"
                  >
                    <div className="glass-panel p-6 h-full flex flex-col justify-between min-h-[160px] bg-deep-space/50 hover:bg-deep-space">
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
                        <span className="text-xs font-mono text-gray-500 group-hover:text-celestial-blue transition-colors mr-2">ACCESS &gt;&gt;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {rootPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif font-bold text-starlight/80 tracking-wider mb-6 border-l-4 border-brass pl-4">UNFILED ENTRIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {rootPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
