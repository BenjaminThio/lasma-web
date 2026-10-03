import 'server-only';
import { headers } from 'next/headers';

/**
 * Best-effort client IP. Behind a trusted proxy (Vercel, Cloudflare, nginx) the first
 * `x-forwarded-for` hop is the client; used only for rate-limit keys, never for auth decisions.
 */
export function clientIpFrom(requestHeaders: Headers): string {
    const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
    return forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown';
}

export async function getClientIp(): Promise<string> {
    return clientIpFrom(await headers());
}

/** Only allow same-site relative paths as post-login destinations (blocks open redirects). */
export function safeRedirectPath(value: unknown, fallback: string): string {
    if (
        typeof value !== 'string' ||
        !value.startsWith('/') ||
        value.startsWith('//') ||
        value.includes('\\')
    ) {
        return fallback;
    }
    return value.slice(0, 512);
}
