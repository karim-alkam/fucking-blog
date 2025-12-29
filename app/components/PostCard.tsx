'use client'

import Link from 'next/link';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="h-full">
      <Link
        href={`/posts/${post.slug}`}
        className="block h-full cyber-card p-6 group"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            {post.draft && (
              <span className="text-cyber-neon-pink font-mono text-xs border border-cyber-neon-pink bg-cyber-neon-pink/10 px-2 py-0.5 rounded-sm animate-pulse shadow-[0_0_8px_rgba(255,0,60,0.5)]">
                DRAFT
              </span>
            )}
            <span className="text-cyber-neon-cyan font-mono text-xs border border-cyber-neon-cyan/30 px-2 py-0.5 rounded-sm">
              {post.date ? formatDate(post.date) : 'LOG_DATE_MISSING'}
            </span>
          </div>
          <div className="w-2 h-2 bg-cyber-neon-pink rounded-full opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(255,0,60,0.8)] transition-all"></div>
        </div>

        <h3 className="text-2xl font-display font-bold text-cyber-white group-hover:text-cyber-neon-yellow transition-colors mb-3 leading-tight">
          {post.title}
        </h3>

        <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed line-clamp-3">
          {post.description}
        </p>

        <div className="mt-auto">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider border border-cyber-gray text-cyber-gray-light group-hover:border-cyber-neon-purple group-hover:text-cyber-neon-purple transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center text-cyber-neon-cyan text-sm font-bold tracking-wide uppercase group-hover:text-cyber-neon-yellow transition-colors">
            Read Protocol
            <svg
              className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </Link>
    </article >
  );
}