'use client'

import Link from 'next/link';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Undated Log';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Undated Log';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPostUrl = () => {
    if (post.folder && post.folder !== 'uncategorized') {
      return `/posts/${post.folder.split('/').map(p => encodeURIComponent(p)).join('/')}/${post.slug}`;
    }
    return `/posts/${post.slug}`;
  };

  return (
    <article className="h-full">
      <Link
        href={getPostUrl()}
        className="block h-full glass-panel p-8 group flex flex-col"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              {post.draft && (
                <span className="text-brass-dark font-sans text-[10px] uppercase tracking-widest border border-brass-dark/50 bg-brass/5 px-2.5 py-1 rounded-full">
                  Draft
                </span>
              )}
              {post.folder && post.folder !== 'uncategorized' && (
                <span className="text-celestial-blue font-mono text-[10px] uppercase tracking-widest border border-celestial-blue/30 bg-deep-space/50 px-2.5 py-1 rounded-sm">
                  DIR: {post.folder.replace(/-/g, ' ')}
                </span>
              )}
            </div>
            <span className="text-starlight/60 font-sans text-xs tracking-wider">
              {formatDate(post.date)}
            </span>
          </div>
          <div className="w-1.5 h-1.5 bg-brass rounded-full opacity-40 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(197,168,105,0.8)] transition-all duration-500 mt-1"></div>
        </div>

        <h3 className="text-2xl lg:text-3xl font-serif font-bold text-starlight group-hover:text-brass transition-colors duration-300 mb-4 leading-snug">
          {post.title}
        </h3>

        <p className="text-aged-parchment/80 text-sm md:text-base mb-8 font-light leading-relaxed line-clamp-3">
          {post.description}
        </p>

        <div className="mt-auto pt-4 border-t border-brass/10">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-[11px] font-sans tracking-wide text-brass-dark/80 group-hover:text-brass transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-brass text-sm font-serif italic group-hover:text-starlight transition-colors duration-300">
            <span>Read Entry</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}