import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Folders in `public/` that hold exported web games. The Godot exports use threads
 * (SharedArrayBuffer), which only work inside a cross-origin isolated document.
 */
const GAME_FOLDERS = 'dafans|stop-syurga|path-of-chemistry|physics-definitions';

const baseSecurityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), fullscreen=(self)',
    },
    ...(isProduction
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
        : []),
];

const crossOriginIsolationHeaders = [
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
    // `NEXT_OUTPUT=standalone` (used by the Dockerfile) emits a self-contained server in .next/standalone.
    output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
    outputFileTracingIncludes: {
        // Read from disk at runtime, so the tracer can't see them.
        '/api/apps/[appId]/thumbnail': ['./public/images/galaxy.webp'],
        '/opengraph-image': ['./src/app/_assets/**'],
    },
    poweredByHeader: false,
    reactStrictMode: true,
    reactCompiler: true,
    typedRoutes: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30,
    },
    async headers() {
        return [
            { source: '/:path*', headers: baseSecurityHeaders },
            // Pages that embed a game must themselves be cross-origin isolated.
            { source: `/:game(${GAME_FOLDERS})`, headers: crossOriginIsolationHeaders },
            // The exported game files: framable by this site only, isolated, and cached.
            {
                source: `/:game(${GAME_FOLDERS})/:file+`,
                headers: [
                    ...crossOriginIsolationHeaders,
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
                    { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
                ],
            },
            {
                source: '/:dir(fonts|images|sounds)/:file+',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' },
                ],
            },
        ];
    },
};

export default nextConfig;
