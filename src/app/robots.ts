import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/account',
                '/console',
                '/create-app',
                '/app/*/edit',
                '/auth/forgot-password',
                '/auth/reset-password',
                '/test',
            ],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
