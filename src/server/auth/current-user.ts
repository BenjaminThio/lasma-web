import 'server-only';
import type { Route } from 'next';
import { redirect, unstable_rethrow } from 'next/navigation';
import { cache } from 'react';
import type { SessionUser } from '@/lib/domain';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { readSession } from './session';

export function avatarUrl(avatarId: string | null): string | null {
    return avatarId ? `/api/avatars/${avatarId}` : null;
}

/** The signed-in user for this request, or `null`. Memoized per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
    const session = await readSession();
    if (!session) return null;

    // Normal path: the profile snapshot on the session, so no second read.
    if (session.profile) {
        return {
            email: session.userId,
            username: session.profile.username,
            avatarUrl: avatarUrl(session.profile.avatarId),
        };
    }

    // Sessions created before snapshots existed.
    const user = await db().users.findByEmail(session.userId);
    return user ? { email: user.email, username: user.username, avatarUrl: avatarUrl(user.avatarId) } : null;
});

/** For chrome like the navbar: a data-store hiccup should render "signed out", not crash the page. */
export async function getCurrentUserSafely(): Promise<SessionUser | null> {
    try {
        return await getCurrentUser();
    } catch (error) {
        // Let Next.js' own control-flow signals (dynamic rendering, redirects) pass through.
        unstable_rethrow(error);
        logger.error('Failed to resolve the current user', { error });
        return null;
    }
}

export function loginPath(returnTo?: string): Route {
    return (returnTo ? `/auth/login?next=${encodeURIComponent(returnTo)}` : '/auth/login') as Route;
}

/** Redirects to the login page (then back to `returnTo`) when nobody is signed in. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user) redirect(loginPath(returnTo));
    return user;
}
