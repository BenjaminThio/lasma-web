import type { MetadataRoute } from 'next';
import { COMPONENT_PAGES } from '@/config/navigation';
import { GAME_LIST } from '@/config/games';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = [
        '/',
        '/apps',
        '/docs',
        '/privacy',
        '/terms',
        '/auth/login',
        '/auth/sign-up',
        '/pop-yi-fan',
        '/lasma-leaderboard',
        ...GAME_LIST.map((game) => `/${game.slug}`),
        ...COMPONENT_PAGES.map((page) => page.href),
    ];

    return paths.map((path) => ({
        url: `${siteConfig.url}${path === '/' ? '' : path}`,
        changeFrequency: path === '/apps' ? 'daily' : 'monthly',
        priority: path === '/' ? 1 : 0.6,
    }));
}
