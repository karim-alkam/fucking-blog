/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';


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
    <div class="relative group my-6 border border-cyber-gray bg-cyber-dark-gray shadow-[4px_4px_0_0_var(--cyber-gray)] rounded-sm">
      <div class="flex justify-between items-center px-3 py-1 border-b border-cyber-gray bg-cyber-black/50">
        <span class="text-xs font-mono text-cyber-neon-cyan uppercase">${language || 'CODE'}</span>
        <button 
          class="copy-btn text-cyber-gray-light hover:text-cyber-neon-yellow transition-colors"
          data-code="${escapedCode}"
          aria-label="Copy code"
          title="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      <pre class="custom-code-scrollbar !p-4 overflow-x-auto"><code class="hljs language-${language} !bg-transparent !p-0 font-mono text-sm block">${highlighted}</code></pre>
    </div>
  `;
};

// Custom link renderer
renderer.link = function ({ href, title, text }: { href: string; title?: string | null; text: string }) {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} class="text-cyber-neon-cyan hover:text-cyber-neon-yellow hover:underline decoration-cyber-neon-yellow underline-offset-4 transition-all break-all">${text}</a>`;
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

  // Style Obsidian Links
  doc.querySelectorAll('.obsidian-link').forEach((link: any) => {
    link.className = '!text-cyber-neon-green !no-underline hover:!text-cyber-neon-yellow hover:!underline !decoration-cyber-neon-yellow !underline-offset-4 !transition-all !break-all';
  });

  // Handle Tables
  doc.querySelectorAll('table').forEach((table: any) => {
    // Create wrapper div
    const wrapper = doc.createElement('div');
    wrapper.className = 'not-prose overflow-x-auto w-full my-8 bg-cyber-dark-gray border border-cyber-gray shadow-lg pb-2 custom-scrollbar';

    // Update table classes and styles for uniformity
    table.classList.add('min-w-full', 'divide-y', 'divide-cyber-gray');
    table.style.whiteSpace = 'nowrap'; // Force horizontal scroll
    if (!table.style.border) {
      table.removeAttribute('border');
    }

    // Style Headers
    table.querySelectorAll('thead').forEach((thead: any) => thead.classList.add('bg-cyber-black'));
    table.querySelectorAll('th').forEach((th: any) => {
      th.className = 'px-6 py-4 text-left text-xs font-mono text-cyber-neon-cyan uppercase tracking-wider border-b border-cyber-gray';
    });

    // Style Body Cells
    table.querySelectorAll('tbody').forEach((tbody: any) => tbody.classList.add('divide-y', 'divide-cyber-gray', 'bg-cyber-dark-gray'));
    table.querySelectorAll('td').forEach((td: any) => {
      td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono';
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
          scrollbar-color: #2a2a2a #050505;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #2a2a2a;
          border: 1px solid #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #FCEE0A;
        }

        /* Code Block Scrollbar (Thinner) */
        .custom-code-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a #121212;
        }
        .custom-code-scrollbar::-webkit-scrollbar {
          height: 8px; /* Thinner than table scrollbar */
        }
        .custom-code-scrollbar::-webkit-scrollbar-track {
          background: #121212;
        }
        .custom-code-scrollbar::-webkit-scrollbar-thumb {
          background-color: #2a2a2a;
          border: 1px solid #121212;
        }
        .custom-code-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #FCEE0A;
        }
      </style>
      ${doc.body.innerHTML}
    `;

  return finalHtml;
}
