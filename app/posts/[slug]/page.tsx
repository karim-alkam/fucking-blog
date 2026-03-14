import { notFound } from 'next/navigation';
import { readdirSync } from 'fs';
import path from 'path';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';
import PostContent from '../components/PostContent';
import TocSidebar from '../components/TocSidebar';
import ScrollToTop from '../components/ScrollToTop';
import MathJaxInit from '../components/MathJaxInit';
import AnalyticsEvents from '../../components/AnalyticsEvents';
import { getPostBySlug } from '../../lib/posts';
import GraphView from '../components/GraphView';

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

import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../../lib/constants';

// ... existing imports

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const postData = await getPostBySlug(params.slug);

  if (!postData) {
    return {
      title: 'LOG: NOT FOUND',
    };
  }

  const title = postData.title;
  const description = postData.description || `Reading entry: ${postData.title}`;
  const url = `${BASE_URL}/posts/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title}`, // OG title doesn't use the template, so we keep it here if we want the full branding for social sharing, OR we rely on generic logic. Usually better to provide full title for OG.
      description,
      type: 'article',
      publishedTime: postData.date,
      url,
      authors: [SITE_CONFIG.author],
      siteName: SITE_CONFIG.title,
      images: [
        {
          url: '/A-logo-w-bg.png', // Fallback to site logo for now
          width: 4096,
          height: 4096,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/A-logo-w-bg.png'],
      creator: SITE_CONFIG.twitterHandle,
    },
  };
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
      <AnalyticsEvents eventName="post_view" eventParams={{ slug: postData.slug, title: postData.title }} />
      {/* Main content area with layout logic */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-center gap-12">
          
          {/* Left Spacer with Graph View */}
          <aside className="hidden 2xl:block w-64 shrink-0">
             <div className="sticky top-24">
                <GraphView currentSlug={postData.slug} />
             </div>
          </aside>

          {/* Post Content Area */}
          <article className="min-w-0 flex-1 max-w-4xl break-words hyphens-auto">
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

              {/* Mobile Inline TOC - visible on mobile/tablet if toc exists */}
              {postData.toc && postData.toc.length > 0 && (
                <div className="lg:hidden mt-8"> 
                  <TocSidebar toc={postData.toc} displayType="inline" />
                </div>
              )}
            </header>

            <PostContent html={postData.content} />

            {/* Mobile Graph View - visible on mobile/tablet (lg:hidden) */}
            <div className="lg:hidden mt-8 mb-4">
               <GraphView currentSlug={postData.slug} />
            </div>

            <div className="mt-12 pt-6 border-t border-gray-700">
              <Link href="/" className="inline-flex items-center text-cyber-neon-cyan hover:text-cyber-neon-yellow transition-colors group font-mono text-sm tracking-wider uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to all posts
              </Link>
            </div>
          </article>

          {/* Right Sidebar (TOC) - Hidden on mobile/tablet, visible on desktop (lg+) */}
          <aside className="hidden lg:block w-80 shrink-0">
             <div className="sticky top-24 flex flex-col gap-8">
               {postData.toc && postData.toc.length > 0 && (
                  <TocSidebar toc={postData.toc} displayType="sidebar" />
               )}
               
               {/* Graph on Laptop (LG - XL) - Hidden on 2XL where it moves to left */}
               <div className="block 2xl:hidden pr-2">
                  <GraphView currentSlug={postData.slug} />
               </div>
             </div>
          </aside>

        </div>
      </div>
    </>
  );
}
