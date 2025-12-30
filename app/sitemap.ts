import { MetadataRoute } from 'next';
import { getPosts } from './lib/posts';
import { getBoards, getDrawingsForBoard } from './lib/boards';
import { BASE_URL } from './lib/constants';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = BASE_URL;

    // Get all posts
    const posts = await getPosts();
    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/posts/${encodeURIComponent(post.slug)}/`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Get all boards and their drawings
    const boards = getBoards();

    // Board collection URLs
    const boardUrls = boards.map((board) => ({
        url: `${baseUrl}/boards/${encodeURIComponent(board)}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Individual drawing URLs
    const drawingUrls = boards.flatMap((board) => {
        const drawings = getDrawingsForBoard(board);
        return drawings.map((drawing) => ({
            url: `${baseUrl}/boards/${encodeURIComponent(board)}/${encodeURIComponent(drawing)}/`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));
    });

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about/`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact/`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...postUrls,
        ...boardUrls,
        ...drawingUrls,
    ];
}
