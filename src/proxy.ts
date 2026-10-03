import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session-cookie';

/** Pages that need an account. The real session check happens on the server; this only skips a wasted render. */
const PROTECTED_PATHS = /^\/(?:account|console|create-app|app\/[^/]+\/edit)(?:\/|$)/;

const isDevelopment = process.env.NODE_ENV === 'development';

/** Everything in the policy except the per-request nonce, built once per server process. */
const SCRIPT_SRC_SUFFIX = `'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`;
const POLICY_REST = [
    // Style attributes (next/image, animations) can't carry nonces; inline CSS can't run code.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''}`,
    "media-src 'self' blob:",
    "frame-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join('; ');

/**
 * Adds a per-request nonce-based Content Security Policy to every page. Next.js reads the nonce
 * from the request header and applies it to its own scripts, so no inline script can run unless
 * it came from us. (React needs eval in development only, for error overlays.)
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PROTECTED_PATHS.test(pathname) && !request.cookies.has(SESSION_COOKIE)) {
        const login = new URL('/auth/login', request.url);
        login.searchParams.set('next', pathname);
        return NextResponse.redirect(login);
    }

    const nonce = btoa(crypto.randomUUID());
    // Only meaningful (and only safe) when the site is actually served over HTTPS.
    const isHttps =
        request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
    const policy = `default-src 'self'; script-src 'self' 'nonce-${nonce}' ${SCRIPT_SRC_SUFFIX}; ${POLICY_REST}${
        isHttps ? '; upgrade-insecure-requests' : ''
    }`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', policy);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', policy);

    return response;
}

export const config = {
    matcher: [
        {
            // Pages only: skip API routes, build assets, and static files in `public/`
            // (the exported games ship their own headers from next.config.ts).
            source: '/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|opengraph-image|robots.txt|sitemap.xml|images/|fonts/|sounds/|json.png|cross.png|dafans/|stop-syurga/|path-of-chemistry/|physics-definitions/).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
