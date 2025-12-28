'use client';

import React, { useEffect } from 'react';


// Declare global interface for MathJax on window
declare global {
    interface Window {
        MathJax?: {
            typesetPromise: () => Promise<void>;
        };
    }
}

const PostContent: React.FC<{ html: string }> = ({ html }) => {
    // Handle copy button clicks using event delegation
    const handleCopyClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const button = target.closest('.copy-btn') as HTMLButtonElement;

        if (!button) return;

        const code = button.getAttribute('data-code');
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);

            // Visual feedback
            const originalContent = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
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

    // Trigger MathJax to typeset on mount and when html changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }, [html]);

    return (
        <div
            className="prose prose-lg dark:prose-invert prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={handleCopyClick}
        />
    );
};

export default PostContent;
