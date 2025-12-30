import { MetadataRoute } from 'next';
import { BASE_URL } from './lib/constants';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = BASE_URL;

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/drafts/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
