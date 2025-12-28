'use client';

import React, { useEffect, useState } from 'react';
import CopyButton from './CopyButton';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';

// Declare global interface for MathJax on window
declare global {
    interface Window {
        MathJax?: {
            typesetPromise: () => Promise<void>;
        };
    }
}

interface PostContentProps {
    html: string | Promise<string>;
}

const PostContent: React.FC<PostContentProps> = ({ html }) => {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([]);

    // Handle Promise<string> content
    useEffect(() => {
        const loadContent = async () => {
            if (html instanceof Promise) {
                const resolvedHtml = await html;
                setHtmlContent(resolvedHtml);
            } else {
                setHtmlContent(html);
            }
        };

        loadContent();
    }, [html]);

    // Process HTML content to add copy buttons
    useEffect(() => {
        if (!htmlContent) return;

        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);

        // Find all pre > code elements
        const codeBlocks = tempDiv.querySelectorAll('pre > code');

        // Apply syntax highlighting to each code block
        codeBlocks.forEach(block => {
            try {
                hljs.highlightElement(block as HTMLElement);
            } catch (e) {
                console.error('Error highlighting code block:', e);
            }
        });

        // Convert the HTML string to React elements with copy buttons
        const parser = new DOMParser();
        const doc = parser.parseFromString(tempDiv.innerHTML, 'text/html');

        // Add break-all to all <a> tags
        doc.querySelectorAll('a').forEach(a => {
            a.classList.add('break-all');
        });

        // Wrap all tables in a div for horizontal scrolling
        doc.querySelectorAll('table').forEach(table => {
            const wrapper = doc.createElement('div');
            wrapper.className = 'overflow-x-auto w-full';
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        const elements = Array.from(doc.body.childNodes);

        // Process each element
        const reactElements = elements.map((node, index) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;

                // Check if this is a pre element with a code child
                if (element.tagName === 'PRE' && element.querySelector('code')) {
                    const codeElement = element.querySelector('code');
                    const codeText = codeElement?.textContent || '';

                    // Return a React element with the code block and copy button
                    return (
                        <div key={index} className="relative">
                            <pre
                                className="relative"
                                dangerouslySetInnerHTML={{ __html: element.innerHTML }}
                            />
                            <div className="absolute top-1 right-1">
                                <CopyButton text={codeText} />
                            </div>
                        </div>
                    );
                }
            }

            // For other elements, just return them as HTML
            return (
                <div key={index} dangerouslySetInnerHTML={{ __html: (node as HTMLElement).outerHTML || node.textContent || '' }} />
            );
        });

        setProcessedContent(reactElements);
    }, [htmlContent]);

    // Trigger MathJax to typeset after content updates to render math expressions
    useEffect(() => {
        if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }, [htmlContent, processedContent]);

    return (
        <div className="prose prose-lg dark:prose-invert prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 max-w-none">
            {processedContent}
        </div>
    );
};

export default PostContent;
