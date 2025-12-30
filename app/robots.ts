import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://blog.salameh.top'; // Update this if using a custom domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/drafts/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
