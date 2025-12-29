import { notFound } from 'next/navigation';
import { readdirSync } from 'fs';
import path from 'path';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';
import PostContent from '../components/PostContent';
import TocSidebar from '../components/TocSidebar';
import ScrollToTop from '../components/ScrollToTop';
import MathJaxInit from '../components/MathJaxInit';
import { getPostBySlug } from '../../lib/posts';

/**
 * Synchronously read the /posts folder so Next infers
 * { slug: string }[] (not Promise<any>).
 */
export function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'posts');
  const files = readdirSync(postsDir);
  return files.map((f) => ({ slug: f.replace(/\.md$/, '') }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// This is a Server Component
export default async function Page(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  const postData = await getPostBySlug(slug);
  if (!postData) return notFound();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Use a fixed format to avoid hydration mismatch
    return date.toISOString().slice(0, 10); // e.g., 2024-06-07
  };

  return (
    <>
      <ScrollToTop />
      <MathJaxInit />
      {/* Main content area with potential sidebar */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Empty left column on large screens */}
        <div className="hidden lg:block lg:col-span-1"></div>

        {/* Post Content (Middle Column - twice the size) */}
        <article className="lg:col-span-2 break-words hyphens-auto">
          {postData.draft && (
            <div className="cyber-card p-4 mb-8 border-l-4 border-cyber-neon-pink bg-cyber-dark-gray/50 flex items-center">
              <span className="text-cyber-neon-pink font-mono uppercase tracking-widest text-sm font-bold mr-3">
                [DRAFT_MODE]
              </span>
              <span className="text-gray-400 font-mono text-xs">
                System_Entry_Is_Not_Finalized
              </span>
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{postData.title}</h1>
            <p className="text-gray-400">{formatDate(postData.date)}</p>

            {/* Mobile Inline TOC - visible on mobile if toc is true */}
            {postData.toc && postData.toc.length > 0 && (
              <div className="lg:hidden mt-8"> {/* Removed container/px as article handles padding */}
                <TocSidebar toc={postData.toc} displayType="inline" />
              </div>
            )}
          </header>

          <PostContent html={postData.content} />

          <div className="mt-12 pt-6 border-t border-gray-700">
            <Link href="/" className="inline-flex items-center text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group font-mono text-sm tracking-wider uppercase">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all posts
            </Link>
          </div>
        </article>

        {/* TOC Sidebar (Right Column) - visible on large screens if toc has items */}
        {postData.toc && postData.toc.length > 0 && (
          <div className="hidden lg:block lg:col-span-1">
            <TocSidebar toc={postData.toc} displayType="sidebar" />
          </div>
        )}
      </div>
    </>
  );
}
