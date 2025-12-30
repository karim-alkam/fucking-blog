import { MetadataRoute } from 'next';
import { getPosts } from './lib/posts';
import { getBoards } from './lib/boards';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://blog.salameh.top'; // Update this if using a custom domain

    // Get all posts
    const posts = await getPosts();
    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Get all boards
    const boards = getBoards();
    const boardUrls = boards.map((board) => ({
        url: `${baseUrl}/boards/${board}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...postUrls,
        ...boardUrls,
    ];
}
