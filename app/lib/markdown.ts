import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import 'highlight.js/styles/github-dark.css';

// Configure marked with custom renderer
const renderer = new marked.Renderer();

// Custom code block renderer with highlighting and copy button
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const language = (lang || '').split(/\s+/)[0];
    const code = text;

    let highlighted = '';
    if (language && hljs.getLanguage(language)) {
        try {
            highlighted = hljs.highlight(code, { language }).value;
        } catch {
            highlighted = code; // Fallback
        }
    } else {
        highlighted = code;
    }

    // Escape the code for the data attribute to be safe
    const escapedCode = code.replace(/"/g, '&quot;');

    return `
    <div class="relative group">
      <pre class="custom-code-scrollbar !p-4"><code class="hljs language-${language} !p-1 !m-1 !mx-2">${highlighted}</code></pre>
      <button 
        class="copy-btn absolute top-2 right-2 p-1 rounded-sm bg-gray-700 hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        data-code="${escapedCode}"
        aria-label="Copy code"
        title="Copy code"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
  `;
};

// Custom link renderer
renderer.link = function ({ href, title, text }: { href: string; title?: string | null; text: string }) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="break-all">${text}</a>`;
};

marked.use({ renderer });
marked.use(gfmHeadingId());
marked.setOptions({ gfm: true, breaks: true });

export async function processMarkdown(content: string): Promise<string> {
    // Parse Markdown to HTML
    const rawHtml = await marked(content);

    // Sanitize HTML
    const htmlContent = DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['iframe'], // Allow iframes if needed
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'class', 'data-code', 'aria-label', 'title'],
    });

    // Post-process HTML with JSDOM
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // Handle Tables
    doc.querySelectorAll('table').forEach((table) => {
        // Create wrapper div
        const wrapper = doc.createElement('div');
        wrapper.className = 'not-prose overflow-x-auto w-full my-6 bg-gray-900 rounded-lg border border-gray-700 pb-2 custom-scrollbar';

        // Update table classes and styles for uniformity
        table.classList.add('min-w-full', 'divide-y', 'divide-gray-700');
        table.style.whiteSpace = 'nowrap'; // Force horizontal scroll
        if (!table.style.border) {
            table.removeAttribute('border');
        }

        // Style Headers
        table.querySelectorAll('thead').forEach(thead => thead.classList.add('bg-gray-800'));
        table.querySelectorAll('th').forEach(th => {
            th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider';
        });

        // Style Body Cells
        table.querySelectorAll('tbody').forEach(tbody => tbody.classList.add('divide-y', 'divide-gray-700', 'bg-gray-900'));
        table.querySelectorAll('td').forEach(td => {
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-300';
        });

        // Insert wrapper and move table into it
        if (table.parentNode) {
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    const finalHtml = `
      <style>
        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #4B5563 #1F2937;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 6px;
          border: 3px solid #1F2937;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6B7280;
        }

        /* Code Block Scrollbar (Thinner) */
        .custom-code-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4B5563 #1F2937;
        }
        .custom-code-scrollbar::-webkit-scrollbar {
          height: 8px; /* Thinner than table scrollbar */
        }
        .custom-code-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .custom-code-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 4px;
          border: 2px solid #1F2937;
        }
        .custom-code-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6B7280;
        }
      </style>
      ${doc.body.innerHTML}
    `;

    return finalHtml;
}
