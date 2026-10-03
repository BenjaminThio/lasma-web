import 'server-only';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { SESSION_COOKIE } from '@/lib/session-cookie';
import { db } from '@/server/db';
import type { SessionRecord, UserRecord } from '@/server/db/types';
import { isProduction } from '@/server/env';
import { logger } from '@/server/logger';
import { randomToken, sha256 } from '@/server/security/crypto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const REMEMBERED_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const baseCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
} as const;

/**
 * Starts a session. The browser gets a random 256-bit token; the database only stores its SHA-256,
 * so a leaked database can't be used to hijack sessions. The user's display name and avatar are
 * copied onto the session so rendering a page needs a single read.
 */
export async function startSession(
    user: Pick<UserRecord, 'email' | 'username' | 'avatarId'>,
    remember: boolean,
): Promise<void> {
    const token = randomToken(32);
    const now = Date.now();
    const ttl = remember ? REMEMBERED_SESSION_TTL_MS : SESSION_TTL_MS;
    const userAgent = ((await headers()).get('user-agent') ?? '').slice(0, 256);

    await db().sessions.create({
        id: sha256(token),
        userId: user.email,
        createdAt: now,
        expiresAt: now + ttl,
        profile: { username: user.username, avatarId: user.avatarId },
        userAgent,
    });

    (await cookies()).set(SESSION_COOKIE, token, {
        ...baseCookie,
        // Without "remember me" the cookie dies with the browser (the server copy expires after a day).
        ...(remember ? { maxAge: ttl / 1000 } : {}),
    });
}

/** Whether a session was started with "remember me" (so a replacement session can match it). */
export function isRememberedSession(session: SessionRecord): boolean {
    return session.expiresAt - session.createdAt > SESSION_TTL_MS;
}

/** Reads and validates the current session. Memoized per request. */
export const readSession = cache(async (): Promise<SessionRecord | null> => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || !TOKEN_PATTERN.test(token)) return null;

    const session = await db().sessions.find(sha256(token));
    if (!session || session.expiresAt <= Date.now()) return null;

    return session;
});

/** Forgets the session cookie without touching the database (the record is already gone). */
export async function clearSessionCookie(): Promise<void> {
    (await cookies()).set(SESSION_COOKIE, '', { ...baseCookie, maxAge: 0 });
}

export async function endSession(): Promise<void> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;

    if (token && TOKEN_PATTERN.test(token)) {
        await db()
            .sessions.delete(sha256(token))
            .catch((error: unknown) => logger.warn('Failed to delete session', { error }));
    }

    await clearSessionCookie();
}
