import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: siteConfig.shortName,
        description: siteConfig.description,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#131314',
        theme_color: '#131314',
        categories: ['developer', 'games', 'utilities'],
        icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
        ],
        shortcuts: [
            { name: 'Console', url: '/console' },
            { name: 'Create an app', url: '/create-app' },
            { name: 'API docs', url: '/docs' },
        ],
    };
}
