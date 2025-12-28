import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Post } from '../types';
import { marked } from 'marked';
import { gfmHeadingId, getHeadingList } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import 'highlight.js/styles/github-dark.css';

// Configure marked with custom renderer
const renderer = new marked.Renderer();

// Custom code block renderer with highlighting and copy button
renderer.code = function ({ text, lang, escaped }: any) {
  const language = (lang || '').split(/\s+/)[0];
  const code = text; // text is already unescaped by marked in newer versions for the code token, or we might need to be careful. 
  // Actually, marked passes specific object. Let's stick to standard signature if possible or handle the object.
  // In marked v12+, renderer methods receive an object ({ text, lang, escaped }).
  // But to be safe with types and avoid confusion, let's use the standard signature if possible, or adapt.
  // Wait, strict types in the file might complain. Let's check imports.
  // We'll rely on simple signature or check what 'marked' version provides. 
  // For simplicity and robustness with standard marked usage:

  let highlighted = '';
  if (language && hljs.getLanguage(language)) {
    try {
      highlighted = hljs.highlight(code, { language }).value;
    } catch (e) {
      highlighted = code; // Fallback
    }
  } else {
    highlighted = code;
  }

  // Escape the code for the data attribute to be safe
  const escapedCode = code.replace(/"/g, '&quot;');

  return `
    <div class="relative group">
      <pre class="custom-code-scrollbar !p-1"><code class="hljs language-${language} !p-1 !m-1 !mx-2">${highlighted}</code></pre>
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
renderer.link = function ({ href, title, text }: any) {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} class="break-all">${text}</a>`;
};


marked.use({ renderer });
marked.use(gfmHeadingId());
marked.setOptions({ gfm: true, breaks: true });

export async function getPosts(includeDrafts: boolean = false): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const dirents = await fs.readdir(postsDirectory, { withFileTypes: true });
  const filenames = dirents.filter(d => d.isFile()).map(d => d.name);

  const posts: Post[] = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, filename);
      const fileContents = await fs.readFile(fullPath, 'utf8');
      const { data } = matter(fileContents);

      // Convert draft field to boolean if it's a string
      const draft = typeof data.draft === 'string'
        ? data.draft.toLowerCase() === 'true'
        : Boolean(data.draft);

      // Ensure date is a string in ISO format
      const date = data.date instanceof Date
        ? data.date.toISOString()
        : String(data.date);

      // Handle tags - ensure they're always an array
      const tags = Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === 'string'
          ? data.tags.split(',').map(tag => tag.trim())
          : [];

      return {
        slug,
        title: data.title,
        date,
        description: data.description || '',
        draft,
        tags,
      };
    })
  );

  const sortedPosts = posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  // Filter out draft posts unless explicitly requested
  const filteredPosts = includeDrafts ? sortedPosts : sortedPosts.filter(post => !post.draft);

  // Log for debugging
  // console.log('Total posts:', sortedPosts.length);
  // console.log('Draft posts:', sortedPosts.filter(post => post.draft).length);
  // console.log('Filtered posts:', filteredPosts.length);

  return filteredPosts;

}

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(process.cwd(), 'posts', `${slug}.md`);
  try {
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Parse Markdown to HTML
    const rawHtml = await marked(content);

    // Sanitize HTML
    const htmlContent = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['iframe'], // Allow iframes if needed, or other tags
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'class', 'data-code', 'aria-label', 'title'], // Ensure data attributes and classes are kept
    });

    // Post-process HTML with JSDOM to handle ALL tables (Markdown + Raw HTML)
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    doc.querySelectorAll('table').forEach((table) => {
      // Create wrapper div
      const wrapper = doc.createElement('div');
      wrapper.className = 'not-prose overflow-x-auto w-full my-6 bg-gray-900 rounded-lg border border-gray-700 pb-2 custom-scrollbar';

      // Update table classes and styles for uniformity
      table.classList.add('min-w-full', 'divide-y', 'divide-gray-700');
      table.style.whiteSpace = 'nowrap'; // Force horizontal scroll
      if (!table.style.border) {
        // If no inline border is specified, we might rely on 'divide-y' or adding a class implies it.
        // But raw HTML dataframes might have border="1". We can leave it or override.
        // Let's ensure it looks like a modern component.
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

    // Ensure date is a string in ISO format
    const date = data.date instanceof Date
      ? data.date.toISOString()
      : String(data.date);

    // Convert draft field to boolean if it's a string
    const draft = typeof data.draft === 'string'
      ? data.draft.toLowerCase() === 'true'
      : Boolean(data.draft);

    // Always generate TOC data using getHeadingList
    const generatedHeadings = getHeadingList();
    const toc = generatedHeadings.map(heading => ({
      level: heading.level,
      text: heading.raw,
      id: heading.id,
    }));

    return {
      slug,
      title: data.title,
      date,
      content: finalHtml,
      draft,
      toc, // Always include toc data
    };
  } catch {
    return null;
  }
} 