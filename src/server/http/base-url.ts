import 'server-only';
import { headers } from 'next/headers';
import { siteConfig } from '@/config/site';
import { env, isProduction } from '@/server/env';

/** The origin this request was served from, so code samples show a URL that actually works. */
export async function getRequestOrigin(): Promise<string> {
    const requestHeaders = await headers();
    const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');

    if (!host || !/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) return siteConfig.url;

    const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
    const protocol = requestHeaders.get('x-forwarded-proto') === 'http' || isLocal ? 'http' : 'https';

    return `${protocol}://${host}`;
}

/**
 * The origin for links that carry secrets (password resets, OAuth callbacks). In production it
 * comes from configuration, never from the request: a spoofed `Host` header must not be able to
 * send a reset token to someone else's domain.
 */
export async function getTrustedOrigin(): Promise<string> {
    if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
    return isProduction ? new URL(siteConfig.url).origin : getRequestOrigin();
}
