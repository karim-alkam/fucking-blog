'use client';

import React, { useEffect } from 'react';

declare global {
    interface Window {
        MathJax?: {
            typesetPromise: () => Promise<void>;
        };
    }
}

const PostContent: React.FC<{ html: string }> = ({ html }) => {
    const handleCopyClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const button = target.closest('.copy-btn') as HTMLButtonElement;

        if (!button) return;

        const code = button.getAttribute('data-code');
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);

            const originalContent = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-celestial-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            `;
            setTimeout(() => {
                button.innerHTML = originalContent;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }, [html]);

    return (
        <div
            className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-serif prose-headings:text-starlight prose-headings:font-bold prose-headings:tracking-wide
            prose-h2:border-b-2 prose-h2:border-brass/10 prose-h2:pb-2 prose-h2:mt-16
            prose-p:text-aged-parchment prose-p:font-light prose-p:leading-loose prose-p:tracking-wide
            prose-a:text-celestial-blue-light prose-a:font-medium prose-a:underline prose-a:decoration-brass/40 prose-a:underline-offset-4 hover:prose-a:text-celestial-blue hover:prose-a:decoration-brass transition-colors
            prose-strong:text-starlight prose-strong:font-medium
            prose-code:text-brass-dark prose-code:bg-void-black/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:font-sans prose-code:text-[0.9em]
            prose-pre:bg-transparent prose-pre:border-0 prose-pre:shadow-none prose-pre:p-0 prose-pre:m-0
            prose-blockquote:border-l-4 prose-blockquote:border-brass/40 prose-blockquote:bg-void-black/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-starlight/70 prose-blockquote:rounded-r-sm
            prose-ul:text-aged-parchment prose-ul:font-light prose-li:marker:text-brass/60 prose-ol:text-aged-parchment"
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={handleCopyClick}
        />
    );
};

export default PostContent;
