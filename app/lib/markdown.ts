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

  // Handle Obsidian Callouts
  doc.querySelectorAll('blockquote').forEach((blockquote: any) => {
    const firstP = blockquote.querySelector('p');
    if (!firstP || !firstP.textContent) return;

    const text = firstP.textContent;
    const match = text.match(/^\[!([a-zA-Z-]+)\](?: (.*))?$/m);

    if (match) {
      const type = match[1].toLowerCase();
      const title = match[2] || type.charAt(0).toUpperCase() + type.slice(1);
      
      // Define styles based on type
      let colorClass = 'border-cyber-neon-blue text-cyber-neon-blue';
      let icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>'; // Default/Note

      // Map types to colors and icons
      switch (type) {
        case 'abstract':
        case 'summary':
        case 'tldr':
          colorClass = 'border-cyber-neon-cyan text-cyber-neon-cyan';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>';
          break;
        case 'info':
        case 'todo':
        case 'note':
          colorClass = 'border-cyber-neon-green text-cyber-neon-green';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>';
          break;
        case 'tip':
        case 'hint':
        case 'important':
          colorClass = 'border-cyber-neon-purple text-cyber-neon-purple';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>';
          break;
        case 'success':
        case 'check':
        case 'done':
          colorClass = 'border-cyber-neon-green text-cyber-neon-green';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
          break;
        case 'question':
        case 'help':
        case 'faq':
          colorClass = 'border-cyber-neon-yellow text-cyber-neon-yellow';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>';
          break;
        case 'warning':
        case 'caution':
        case 'attention':
          colorClass = 'border-cyber-neon-pink text-cyber-neon-pink';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
          break;
        case 'failure':
        case 'fail':
        case 'missing':
        case 'danger':
        case 'error':
        case 'bug':
          colorClass = 'border-cyber-neon-pink text-cyber-neon-pink';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';
          break;
        case 'example':
          colorClass = 'border-cyber-neon-purple text-cyber-neon-purple';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.761 2.156 18 5.002 18h9.996c2.846 0 4.185-3.239 2.295-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a4 4 0 00-2.17-.102l1.027-1.028A3 3 0 009 8.172zM7 3a1 1 0 011-1h4a1 1 0 011 1v1H7V3z" clip-rule="evenodd" /></svg>';
          break;
        case 'quote':
        case 'cite':
          colorClass = 'border-cyber-gray-light text-cyber-gray-light';
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" /></svg>';
          break;
      }

      const container = doc.createElement('div');
      container.className = `my-6 border-l-4 ${colorClass} bg-cyber-dark-gray/30 rounded-r-md overflow-hidden shadow-lg`;

      const header = doc.createElement('div');
      header.className = `flex items-center gap-2 px-4 py-2 font-bold bg-cyber-black/20 ${colorClass}`;
      header.innerHTML = `${icon} <span>${title}</span>`;
      container.appendChild(header);

      const content = doc.createElement('div');
      content.className = 'px-4 pb-4 pt-2 text-gray-300 prose prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed [&>*:first-child]:mt-0';
      
      // Remove the callout line from the first paragraph
      const rawHtml = firstP.innerHTML;
      const cleanHtml = rawHtml.replace(match[0], '').trim();
      
      if (cleanHtml) {
        firstP.innerHTML = cleanHtml;
      } else {
        firstP.remove();
      }

      // Move all children of blockquote to content div
      while (blockquote.firstChild) {
        content.appendChild(blockquote.firstChild);
      }
      
      container.appendChild(content);
      
      if (blockquote.parentNode) {
        blockquote.parentNode.replaceChild(container, blockquote);
      }
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
