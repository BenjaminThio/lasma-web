import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { env, features, isProduction } from '@/server/env';
import { getTrustedOrigin } from '@/server/http/base-url';
import { randomToken, safeEqual } from '@/server/security/crypto';
import type { GoogleProfile } from '@/server/services/accounts';

/*
 * "Sign in with Google" using the OAuth 2.0 authorization code flow with PKCE. The ID token comes
 * straight from Google's token endpoint over TLS in exchange for our client secret, so (per OpenID
 * Connect Core 3.1.3.7) its claims are checked but its signature doesn't need separate validation.
 */

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const FLOW_COOKIE = isProduction ? '__Host-lasma-oauth' : 'lasma-oauth';
const FLOW_TTL_SECONDS = 10 * 60;

export type GoogleIntent = 'login' | 'link';

const flowSchema = z.object({
    state: z.string().min(20),
    verifier: z.string().min(43),
    nonce: z.string().min(20),
    intent: z.enum(['login', 'link']),
    next: z.string(),
});
type Flow = z.infer<typeof flowSchema>;

export const isGoogleEnabled = () => features.google;

async function callbackUrl(): Promise<string> {
    return `${await getTrustedOrigin()}/api/auth/google/callback`;
}

/** Creates the flow cookie and returns Google's consent screen URL. */
export async function beginGoogleFlow(intent: GoogleIntent, next: string): Promise<string> {
    const flow: Flow = {
        state: randomToken(24),
        verifier: randomToken(48),
        nonce: randomToken(24),
        intent,
        next,
    };

    (await cookies()).set(FLOW_COOKIE, Buffer.from(JSON.stringify(flow)).toString('base64url'), {
        httpOnly: true,
        secure: isProduction,
        // Lax so the cookie comes back on Google's top-level redirect to the callback.
        sameSite: 'lax',
        path: '/',
        maxAge: FLOW_TTL_SECONDS,
    });

    const url = new URL(AUTHORIZE_URL);
    url.search = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID ?? '',
        redirect_uri: await callbackUrl(),
        response_type: 'code',
        scope: 'openid email profile',
        state: flow.state,
        nonce: flow.nonce,
        code_challenge: createHash('sha256').update(flow.verifier).digest('base64url'),
        code_challenge_method: 'S256',
        prompt: 'select_account',
    }).toString();

    return url.toString();
}

/** Reads and clears the flow cookie (each flow is single-use). */
export async function takeGoogleFlow(): Promise<Flow | null> {
    const store = await cookies();
    const raw = store.get(FLOW_COOKIE)?.value;
    store.set(FLOW_COOKIE, '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    if (!raw) return null;
    try {
        const parsed = flowSchema.safeParse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export class GoogleFlowError extends Error {
    constructor(readonly reason: 'google_state' | 'google_failed' | 'google_unverified') {
        super(reason);
        this.name = 'GoogleFlowError';
    }
}

const tokenResponseSchema = z.object({ id_token: z.string() });

const claimsSchema = z.object({
    iss: z.string(),
    aud: z.string(),
    sub: z.string().min(1).max(255),
    exp: z.number(),
    nonce: z.string().optional(),
    email: z.email().max(254),
    email_verified: z.boolean().optional(),
    name: z.string().max(200).optional(),
});

/** Exchanges the authorization code and returns the verified Google profile. */
export async function completeGoogleFlow(
    flow: Flow,
    state: string | null,
    code: string | null,
): Promise<GoogleProfile> {
    if (!state || !code || !safeEqual(state, flow.state)) throw new GoogleFlowError('google_state');

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID ?? '',
            client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
            redirect_uri: await callbackUrl(),
            grant_type: 'authorization_code',
            code_verifier: flow.verifier,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new GoogleFlowError('google_failed');

    const token = tokenResponseSchema.safeParse(await response.json());
    const payload = token.success ? token.data.id_token.split('.')[1] : undefined;
    if (!payload) throw new GoogleFlowError('google_failed');

    const claims = claimsSchema.safeParse(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')));
    if (!claims.success) throw new GoogleFlowError('google_failed');

    const { iss, aud, exp, nonce, sub, email, email_verified: verified, name } = claims.data;
    const valid =
        ISSUERS.has(iss) &&
        aud === env.GOOGLE_CLIENT_ID &&
        exp * 1000 > Date.now() &&
        nonce !== undefined &&
        safeEqual(nonce, flow.nonce);

    if (!valid) throw new GoogleFlowError('google_failed');
    if (verified !== true) throw new GoogleFlowError('google_unverified');

    return { sub, email: email.toLowerCase(), name: name ?? null };
}
