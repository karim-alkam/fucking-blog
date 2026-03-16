import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Post } from '../types';
import { getHeadingList } from 'marked-gfm-heading-id';
import { processMarkdown } from './markdown';

/**
 * Safely convert a frontmatter date value to an ISO string.
 * Returns null if the value is missing or cannot be parsed.
 */
function safeDate(raw: unknown): string | null {
  if (!raw) return null;
  // gray-matter may already give us a JS Date object for YAML dates
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw.toISOString();
  }
  const str = String(raw).trim();
  if (!str || str === 'undefined' || str === 'null') return null;
  // Try native parse
  const ms = Date.parse(str);
  if (!isNaN(ms)) return new Date(ms).toISOString();
  return null; // truly unparseable — caller will show 'Undated'
}

async function walk(dir: string, filterFn: (path: string) => boolean = () => true): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...(await walk(full, filterFn)));
    } else if (ent.isFile() && filterFn(full)) {
      files.push(full);
    }
  }
  return files;
}

export async function getAllFolders(dir: string = ''): Promise<string[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const targetDir = path.join(postsDirectory, dir);
  
  const folders: string[] = [];
  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory() && ent.name !== '.obsidian' && ent.name !== '.trash') {
        const relPath = dir ? `${dir}/${ent.name}` : ent.name;
        folders.push(relPath);
        folders.push(...await getAllFolders(relPath));
      }
    }
  } catch {}
  return folders;
}

export async function isDirectory(folderPath: string): Promise<boolean> {
  const absolutePath = path.join(process.cwd(), 'posts', folderPath);
  try {
    const stat = await fs.stat(absolutePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function getFolderContents(folderPath: string = '') {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const targetDir = folderPath ? path.join(postsDirectory, folderPath) : postsDirectory;

  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const subDirs = entries.filter(e => e.isDirectory() && e.name !== '.obsidian' && e.name !== '.trash').map(e => e.name);
    const mdFiles = entries.filter(e => e.isFile() && e.name.endsWith('.md'));

    const posts: Post[] = await Promise.all(mdFiles.map(async (file) => {
      const slug = file.name.replace(/\.md$/, '');
      const postFolder = folderPath || 'uncategorized';
      const fullPath = path.join(targetDir, file.name);
      const fileContents = await fs.readFile(fullPath, 'utf8');
      const { data } = matter(fileContents);
      
      const draft = typeof data.draft === 'string'
        ? data.draft.toLowerCase() === 'true'
        : Boolean(data.draft);

      const date = data.date instanceof Date
        ? data.date.toISOString()
        : String(data.date);

      const tags = Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === 'string'
          ? data.tags.split(',').map(tag => tag.trim())
          : [];

      return {
          slug,
          folder: postFolder,
          title: data.title,
          date,
          description: data.description || '',
          draft,
          tags,
      };
    }));

    return { 
      subDirs, 
      posts: posts.sort((a, b) => ((a.date ?? '') < (b.date ?? '') ? 1 : -1)).filter(p => !p.draft) 
    };
  } catch {
    return { subDirs: [], posts: [] };
  }
}

export async function getPosts(includeDrafts: boolean = false, folder?: string): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let searchDir = postsDirectory;
  
  if (folder) {
    searchDir = path.join(postsDirectory, folder);
  }

  try {
    const mdFilesFullPaths = await walk(searchDir, f => f.endsWith('.md'));
    const filenames = mdFilesFullPaths.map(f => path.relative(postsDirectory, f));

    const posts: Post[] = await Promise.all(
      filenames.map(async (filename) => {
        // filename looks like 'Folder/Post.md'
        const parts = filename.split(path.sep);
        const slugWithExt = parts.pop() || '';
        const slug = slugWithExt.replace(/\.md$/, '');
        const postFolder = parts.join('/') || 'uncategorized';

        const fullPath = path.join(postsDirectory, filename);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { data } = matter(fileContents);

        // Convert draft field to boolean if it's a string
        const draft = typeof data.draft === 'string'
          ? data.draft.toLowerCase() === 'true'
          : Boolean(data.draft);

        // Ensure date is a string in ISO format — fall back to null for bogus values
        const date = safeDate(data.date);

        // Handle tags - ensure they're always an array
        const tags = Array.isArray(data.tags)
          ? data.tags
          : typeof data.tags === 'string'
            ? data.tags.split(',').map(tag => tag.trim())
            : [];

        return {
          slug,
          folder: postFolder,
          title: data.title,
          date,
          description: data.description || '',
          draft,
          tags,
        };
      })
    );

    const sortedPosts = posts.sort((a, b) => ((a.date ?? '') < (b.date ?? '') ? 1 : -1));
    const filteredPosts = includeDrafts ? sortedPosts : sortedPosts.filter(post => !post.draft);
    return filteredPosts;
  } catch {
    return [];
  }
}

export async function getPost(folder: string, slug: string) {
  const subPath = folder === 'uncategorized' ? '' : folder;
  const fullPath = path.join(process.cwd(), 'posts', subPath, `${slug}.md`);
  try {
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Process content using our centralized engine
    const finalHtml = await processMarkdown(content);

    // Ensure date is safely parsed — returns null for bogus/missing values
    const date = safeDate(data.date);

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

    // Handle tags - ensure they're always an array
    const tags = Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === 'string'
        ? data.tags.split(',').map((tag: string) => tag.trim())
        : [];

    return {
      slug,
      folder,
      title: data.title,
      date,
      content: finalHtml,
      draft,
      description: data.description || '',
      tags,
      toc, // Always include toc data
    };
  } catch {
    return null;
  }
}
