import { notFound } from 'next/navigation';
import { readdirSync } from 'fs';
import path from 'path';
import 'highlight.js/styles/github-dark.css';
import Script from 'next/script';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';
import TocSidebar from '../../components/TocSidebar';
import ScrollToTop from '../../components/ScrollToTop';
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

  // If it's a draft post, we still show it but with a draft indicator
  if (postData.draft) {
    return (
      <>
        <ScrollToTop />
        <Script
          id="MathJax-config"
          strategy="beforeInteractive"
        >
          {`
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
              },
              svg: {
                fontCache: 'global'
              }
            };
          `}
        </Script>
        <Script
          type="text/javascript"
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        />
        <div className="container mx-auto px-4 py-8">
          <article className="max-w-3xl mx-auto break-words hyphens-auto">
            <div className="bg-yellow-500 text-black px-4 py-2 mb-4 rounded">
              This is a draft post
            </div>
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{postData.title}</h1>
              <p className="text-gray-400">{formatDate(postData.date)}</p>
            </header>
            <CodeBlock html={postData.content} />
            <div className="mt-12 pt-6 border-t border-gray-700">
              <Link href="/" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to all posts
              </Link>
            </div>
          </article>
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Script
        id="MathJax-config"
        strategy="beforeInteractive"
      >
        {`
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$']],
              displayMath: [['$$', '$$']],
            },
            svg: {
              fontCache: 'global'
            }
          };
        `}
      </Script>
      <Script
        type="text/javascript"
        id="MathJax-script"
        async
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
      />
      {/* Main content area with potential sidebar */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Empty left column on large screens */}
        <div className="hidden lg:block lg:col-span-1"></div>

        {/* Post Content (Middle Column - twice the size) */}
        <article className="lg:col-span-2 break-words hyphens-auto">
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

          <CodeBlock html={postData.content} />
          <div className="mt-12 pt-6 border-t border-gray-700">
            <Link href="/" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
