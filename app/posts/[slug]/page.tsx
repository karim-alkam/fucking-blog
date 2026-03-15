import { notFound } from 'next/navigation';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';
import PostContent from '../components/PostContent';
import TocSidebar from '../components/TocSidebar';
import ScrollToTop from '../components/ScrollToTop';
import MathJaxInit from '../components/MathJaxInit';
import AnalyticsEvents from '../../components/AnalyticsEvents';
import { getPostBySlug, getPosts } from '../../lib/posts';
import GraphView from '../components/GraphView';

export async function generateStaticParams() {
  const posts = await getPosts(true); 
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../../lib/constants';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const postData = await getPostBySlug(params.slug);

  if (!postData) {
    return {
      title: 'ENTRY NOT FOUND',
    };
  }

  const title = postData.title;
  const description = postData.description || `Reading entry: ${postData.title}`;
  const url = `${BASE_URL}/posts/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title}`,
      description,
      type: 'article',
      publishedTime: postData.date,
      url,
      authors: [SITE_CONFIG.author],
      siteName: SITE_CONFIG.title,
      images: [
        {
          url: '/A-logo-w-bg.png',
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
    return date.toISOString().slice(0, 10);
  };

  return (
    <>
      <ScrollToTop />
      <MathJaxInit />
      <AnalyticsEvents eventName="post_view" eventParams={{ slug: postData.slug, title: postData.title }} />
      {/* Main content area with layout logic */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row justify-center gap-16">
          
          {/* Left Spacer with Graph View */}
          <aside className="hidden 2xl:block w-72 shrink-0">
             <div className="sticky top-32">
                <GraphView currentSlug={postData.slug} />
             </div>
          </aside>

          {/* Post Content Area */}
          <article className="min-w-0 flex-1 max-w-4xl break-words hyphens-auto">
            {postData.draft && (
              <div className="glass-panel p-5 mb-10 border-l-4 border-l-brass flex items-center bg-void-black/30">
                <span className="text-brass font-sans uppercase tracking-[0.2em] text-xs font-medium mr-4">
                  Draft Record
                </span>
                <span className="text-starlight/50 font-sans font-light italic text-xs">
                  This entry is incomplete and subject to alteration.
                </span>
              </div>
            )}

            <header className="mb-14 border-b border-brass/10 pb-8 relative">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-starlight mb-6 leading-tight">{postData.title}</h1>
              <div className="flex items-center gap-4 text-starlight/60 font-sans text-sm tracking-widest uppercase mb-2">
                <time dateTime={postData.date}>{formatDate(postData.date)}</time>
                {postData.tags && postData.tags.length > 0 && (
                  <>
                    <span className="text-brass/40">&bull;</span>
                    <span className="text-brass">{postData.tags[0]}</span>
                  </>
                )}
              </div>

              {/* Mobile Inline TOC - visible on mobile/tablet if toc exists */}
              {postData.toc && postData.toc.length > 0 && (
                <div className="lg:hidden mt-10"> 
                  <TocSidebar toc={postData.toc} displayType="inline" />
                </div>
              )}
            </header>

            <PostContent html={postData.content} />

            {/* Mobile Graph View - visible on mobile/tablet (lg:hidden) */}
            <div className="lg:hidden mt-16 mb-8">
               <GraphView currentSlug={postData.slug} />
            </div>

            <div className="mt-20 pt-10 border-t border-brass/20 flex justify-center lg:justify-start">
              <Link href="/" className="inline-flex items-center text-brass hover:text-starlight transition-colors duration-300 group font-sans tracking-[0.2em] uppercase text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:-translate-x-2 transition-transform duration-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Archives
              </Link>
            </div>
          </article>

          {/* Right Sidebar (TOC) - Hidden on mobile/tablet, visible on desktop (lg+) */}
          <aside className="hidden lg:block w-80 shrink-0">
             <div className="sticky top-32 flex flex-col gap-10">
               {postData.toc && postData.toc.length > 0 && (
                  <TocSidebar toc={postData.toc} displayType="sidebar" />
               )}
               
               {/* Graph on Laptop (LG - XL) - Hidden on 2XL where it moves to left */}
               <div className="block 2xl:hidden pr-4">
                  <GraphView currentSlug={postData.slug} />
               </div>
             </div>
          </aside>

        </div>
      </div>
    </>
  );
}
