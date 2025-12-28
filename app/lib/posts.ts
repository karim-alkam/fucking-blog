import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Post } from '../types';
import { getHeadingList } from 'marked-gfm-heading-id';
import { processMarkdown } from './markdown';

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

  return filteredPosts;

}

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(process.cwd(), 'posts', `${slug}.md`);
  try {
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Process content using our centralized engine
    const finalHtml = await processMarkdown(content);

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
