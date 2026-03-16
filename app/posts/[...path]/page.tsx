import { notFound } from 'next/navigation';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import Breadcrumbs from '../components/Breadcrumbs';

import PostContent from '../components/PostContent';
import TocSidebar from '../components/TocSidebar';
import ScrollToTop from '../components/ScrollToTop';
import MathJaxInit from '../components/MathJaxInit';
import GraphView from '../components/GraphView';

import AnalyticsEvents from '../../components/AnalyticsEvents';
import PostsList from '../../components/PostsList';

import { getPost, getPosts, getAllFolders, isDirectory, getFolderContents } from '../../lib/posts';
import { SITE_CONFIG, BASE_URL } from '../../lib/constants';

export async function generateStaticParams() {
  const folders = await getAllFolders();
  const posts = await getPosts(true);

  const paths: { path: string[] }[] = [];

  for (const f of folders) {
    paths.push({ path: f.split('/') });
  }

  for (const p of posts) {
    if (p.folder && p.folder !== 'uncategorized') {
      paths.push({ path: [...p.folder.split('/'), p.slug] });
    } else {
      // Uncategorized posts are just /posts/[slug]
      paths.push({ path: [p.slug] });
    }
  }

  return paths;
}

interface PageProps {
  params: Promise<{
    path: string[];
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const decodedPath = params.path.map(p => decodeURIComponent(p));
  const fullPathStr = decodedPath.join('/');

  if (await isDirectory(fullPathStr)) {
    return {
      title: `DIR: ${decodedPath[decodedPath.length - 1]}`,
    };
  }

  const slug = decodedPath[decodedPath.length - 1];
  const folder = decodedPath.slice(0, -1).join('/') || 'uncategorized';
  const postData = await getPost(folder, slug);

  if (!postData) {
    return { title: 'NOT FOUND' };
  }

  const title = postData.title;
  const description = postData.description || `Reading entry: ${postData.title}`;
  const url = `${BASE_URL}/posts/${fullPathStr}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title}`,
      description,
      type: 'article',
      publishedTime: postData.date ?? undefined,
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

export default async function CatchAllPage(props: PageProps) {
  const params = await props.params;
  const decodedPath = params.path.map(p => decodeURIComponent(p));
  const fullPathStr = decodedPath.join('/');

  const isDir = await isDirectory(fullPathStr);

  if (isDir) {
    return <FolderView folderPath={fullPathStr} />;
  }

  const slug = decodedPath[decodedPath.length - 1];
  const folder = decodedPath.slice(0, -1).join('/') || 'uncategorized';
  const postData = await getPost(folder, slug);

  if (!postData) return notFound();

  return <PostView postData={postData} />;
}

// ======== VIEWS ========

async function FolderView({ folderPath }: { folderPath: string }) {
  const { subDirs, posts } = await getFolderContents(folderPath);
  const folderName = folderPath.split('/').pop() || folderPath;
  
  // We need a path to go back. If it's a subfolder, go up one level.
  const parentPath = folderPath.includes('/') 
    ? `/posts/${folderPath.split('/').slice(0, -1).map(p => encodeURIComponent(p)).join('/')}` 
    : '/posts';

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen">
      <Breadcrumbs folderPath={folderPath} showCurrent={false} />
      
      {subDirs.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-serif font-bold text-starlight/80 tracking-wider mb-6 border-l-4 border-brass pl-4">SUB-DIRECTORIES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subDirs.map((dir: string) => (
              <Link
                key={dir}
                href={`/posts/${folderPath.split('/').map(p => encodeURIComponent(p)).join('/')}/${encodeURIComponent(dir)}`}
                className="group block"
              >
                <div className="glass-panel p-6 h-full flex flex-col justify-between min-h-[160px] bg-deep-space/50 hover:bg-deep-space">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-celestial-blue font-mono text-xs border border-celestial-blue/30 px-2 py-0.5">DIRECTORY</span>
                      <div className="w-2 h-2 bg-brass-dark rounded-full opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(252,238,10,0.8)] transition-all"></div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-starlight group-hover:text-celestial-blue transition-colors uppercase truncate">
                      {dir.replace(/-/g, ' ')}
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

      {posts.length > 0 && (
        <Suspense fallback={<div className="text-center py-20 text-starlight/60 font-sans tracking-widest uppercase">Extracting Logs...</div>}>
          <PostsList posts={posts} title={`Directory: ${folderName}`} />
        </Suspense>
      )}

      {subDirs.length === 0 && posts.length === 0 && (
        <div className="p-8 border border-dashed border-brass/20 text-center text-starlight font-mono mt-8">
          NO_CONTENT_DETECTED
        </div>
      )}
    </div>
  );
}

async function PostView({ postData }: { postData: any }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Undated';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Undated';
    return d.toISOString().slice(0, 10);
  };

  const parentFolder = postData.folder !== 'uncategorized' 
    ? `/posts/${postData.folder.split('/').map((p: string) => encodeURIComponent(p)).join('/')}` 
    : '/posts';

  return (
    <>
      <ScrollToTop />
      <MathJaxInit />
      <AnalyticsEvents eventName="post_view" eventParams={{ slug: postData.slug, title: postData.title }} />
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row justify-center gap-16">
          <aside className="hidden 2xl:block w-72 shrink-0">
             <div className="sticky top-32">
                <GraphView currentSlug={postData.slug} />
             </div>
          </aside>
          <article className="min-w-0 flex-1 max-w-4xl break-words hyphens-auto">
            <Breadcrumbs
              folderPath={postData.folder !== 'uncategorized' ? postData.folder : undefined}
              currentLabel={postData.title}
            />
            {postData.draft && (
              <div className="glass-panel p-5 mb-10 border-l-4 border-l-brass flex items-center bg-void-black/30">
                <span className="text-brass font-sans uppercase tracking-[0.2em] text-xs font-medium mr-4">Draft Record</span>
                <span className="text-starlight/50 font-sans font-light italic text-xs">This entry is incomplete and subject to alteration.</span>
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
              {postData.toc && postData.toc.length > 0 && (
                <div className="lg:hidden mt-10"> 
                  <TocSidebar toc={postData.toc} displayType="inline" />
                </div>
              )}
            </header>
            <PostContent html={postData.content} />
            <div className="lg:hidden mt-16 mb-8">
               <GraphView currentSlug={postData.slug} />
            </div>
            <div className="mt-20 pt-10 border-t border-brass/20 flex justify-center lg:justify-start">
              <Link href={parentFolder} className="inline-flex items-center text-brass hover:text-starlight transition-colors duration-300 group font-sans tracking-[0.2em] uppercase text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:-translate-x-2 transition-transform duration-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Directory
              </Link>
            </div>
          </article>
          <aside className="hidden lg:block w-80 shrink-0">
             <div className="sticky top-32 flex flex-col gap-10">
               {postData.toc && postData.toc.length > 0 && (
                  <TocSidebar toc={postData.toc} displayType="sidebar" />
               )}
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
