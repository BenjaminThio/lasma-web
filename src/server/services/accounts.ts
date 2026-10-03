import 'server-only';
import { userAgent } from 'next/server';
import { LIMITS } from '@/lib/constants';
import type { AccountOverview, ActiveSession, DeviceKind } from '@/lib/domain';
import { containsPersonalInfo } from '@/lib/password-policy';
import { hashPassword, needsRehash, simulatePasswordCheck, verifyPassword } from '@/server/auth/password';
import { avatarUrl } from '@/server/auth/current-user';
import { db } from '@/server/db';
import type { SessionRecord, UserRecord } from '@/server/db/types';
import { badRequest, FieldError, fieldError, notFound, unauthorized } from '@/server/errors';
import { logger } from '@/server/logger';
import { randomToken, safeEqual, sha256 } from '@/server/security/crypto';
import { PERSONAL_PASSWORD_MESSAGE, cleanText } from '@/server/validation';
import { processImageUpload } from './images';

/* ─── Sign-up and login ─────────────────────────────────────────────────────── */

export async function registerAccount(input: {
    username: string;
    email: string;
    password: string;
}): Promise<UserRecord | null> {
    const passwordHash = await hashPassword(input.password);
    const created = await db().users.create({ email: input.email, username: input.username, passwordHash });

    if (!created) return null;

    return {
        email: input.email,
        username: input.username,
        passwordHash,
        legacyPassword: null,
        avatarId: null,
        googleSub: null,
        createdAt: Date.now(),
    };
}

async function upgradeHash(user: UserRecord, password: string): Promise<void> {
    try {
        await db().users.setPasswordHash(user.email, await hashPassword(password));
    } catch (error) {
        // The login itself succeeded; a failed upgrade is retried on the next login.
        logger.error('Failed to upgrade password hash', { error, user: user.email });
    }
}

/** Older accounts were stored under the email exactly as typed (not lower-cased). */
export async function findAccount(email: string, typedEmail = email): Promise<UserRecord | null> {
    const exact = await db().users.findByEmail(email);
    if (exact) return exact;

    const typed = typedEmail.trim();
    return typed !== email ? db().users.findByEmail(typed) : null;
}

function hasPassword(user: UserRecord): boolean {
    return user.passwordHash !== null || user.legacyPassword !== null;
}

/** Checks a password in constant-ish time whether or not the account has one. */
async function passwordMatches(user: UserRecord | null, password: string): Promise<boolean> {
    if (user?.passwordHash) {
        const valid = await verifyPassword(password, user.passwordHash);
        if (valid && needsRehash(user.passwordHash)) await upgradeHash(user, password);
        return valid;
    }

    if (typeof user?.legacyPassword === 'string') {
        if (!safeEqual(password, user.legacyPassword)) {
            await simulatePasswordCheck(password);
            return false;
        }
        // Accounts from the first version of the site: accept once, then store a real hash.
        await upgradeHash(user, password);
        return true;
    }

    await simulatePasswordCheck(password);
    return false;
}

export async function authenticate(
    email: string,
    password: string,
    typedEmail: string,
): Promise<UserRecord | null> {
    const user = await findAccount(email, typedEmail);
    return (await passwordMatches(user, password)) ? user : null;
}

/* ─── Google ────────────────────────────────────────────────────────────────── */

export interface GoogleProfile {
    sub: string;
    email: string;
    name: string | null;
}

export type GoogleSignInResult =
    | { ok: true; user: UserRecord; created: boolean }
    | { ok: false; reason: 'google_in_use' | 'google_email_exists' };

function usernameFromGoogle(profile: GoogleProfile): string {
    const name = cleanText(profile.name ?? '')
        .slice(0, LIMITS.username)
        .trim();
    return name || (profile.email.split('@')[0] ?? 'Player').slice(0, LIMITS.username);
}

/**
 * Signs in with a verified Google identity: the linked account, or a new one. Linking only happens
 * from the account page while signed in (`linkTo`). Linking by matching email is deliberately not
 * done: sign-up doesn't verify emails, so someone could pre-register a victim's address with a
 * password and wait for the victim to "Sign in with Google" into an account the attacker controls.
 */
export async function signInWithGoogle(
    profile: GoogleProfile,
    linkTo: string | null,
): Promise<GoogleSignInResult> {
    const linked = await db().users.findByGoogleSub(profile.sub);

    if (linkTo) {
        if (linked && linked.email !== linkTo) return { ok: false, reason: 'google_in_use' };

        const user = await db().users.findByEmail(linkTo);
        if (!user) throw unauthorized('Your session has ended. Log in again.');

        if (!linked) await db().users.update(user.email, { googleSub: profile.sub });
        return { ok: true, user: { ...user, googleSub: profile.sub }, created: false };
    }

    if (linked) return { ok: true, user: linked, created: false };

    if (await findAccount(profile.email)) return { ok: false, reason: 'google_email_exists' };

    const username = usernameFromGoogle(profile);
    const created = await db().users.create({
        email: profile.email,
        username,
        passwordHash: null,
        googleSub: profile.sub,
    });

    // Lost a race with a password sign-up for the same email.
    if (!created) return { ok: false, reason: 'google_email_exists' };

    return {
        ok: true,
        created: true,
        user: {
            email: profile.email,
            username,
            passwordHash: null,
            legacyPassword: null,
            avatarId: null,
            googleSub: profile.sub,
            createdAt: Date.now(),
        },
    };
}

/* ─── Account page ──────────────────────────────────────────────────────────── */

async function requireAccount(email: string): Promise<UserRecord> {
    const user = await db().users.findByEmail(email);
    if (!user) throw unauthorized('Your session has ended. Log in again.');
    return user;
}

async function syncSessionProfiles(user: Pick<UserRecord, 'email' | 'username' | 'avatarId'>): Promise<void> {
    await db().sessions.updateProfileByUser(user.email, { username: user.username, avatarId: user.avatarId });
}

export async function getAccountOverview(email: string): Promise<AccountOverview | null> {
    const user = await db().users.findByEmail(email);
    if (!user) return null;

    return {
        email: user.email,
        username: user.username,
        avatarUrl: avatarUrl(user.avatarId),
        createdAt: user.createdAt,
        hasPassword: hasPassword(user),
        googleLinked: user.googleSub !== null,
    };
}

export async function updateUsername(email: string, username: string): Promise<void> {
    const user = await requireAccount(email);
    if (user.username === username) return;

    await db().users.update(email, { username });
    await syncSessionProfiles({ ...user, username });
}

/** Stores a new avatar (or removes it with `null`). Resolves the new avatar URL. */
export async function updateAvatar(email: string, dataUrl: string | null): Promise<string | null> {
    const user = await requireAccount(email);
    let avatarId: string | null = null;

    if (dataUrl) {
        const image = await processImageUpload(dataUrl, 'avatar');
        // A fresh random id per upload, so avatar URLs can be cached forever.
        avatarId = randomToken(18);
        await db().avatars.create({ id: avatarId, dataUrl: image, createdAt: Date.now() });
    }

    await db().users.update(email, { avatarId });
    await syncSessionProfiles({ ...user, avatarId });

    if (user.avatarId) {
        await db()
            .avatars.delete(user.avatarId)
            .catch((error: unknown) => logger.warn('Failed to delete a replaced avatar', { error }));
    }

    return avatarUrl(avatarId);
}

/**
 * Sets a new password after checking the current one (accounts created with Google may set their
 * first password without one). Every other session is signed out. Resolves how many were.
 */
export async function changePassword(
    email: string,
    currentSessionId: string,
    input: { currentPassword: string; newPassword: string },
): Promise<number> {
    const user = await requireAccount(email);

    if (hasPassword(user)) {
        if (!input.currentPassword) throw fieldError('currentPassword', 'Enter your current password.');
        if (!(await passwordMatches(user, input.currentPassword))) {
            throw fieldError('currentPassword', 'Your current password is incorrect.');
        }
    }
    if (containsPersonalInfo(input.newPassword, [user.username, user.email])) {
        throw fieldError('newPassword', PERSONAL_PASSWORD_MESSAGE);
    }

    await db().users.setPasswordHash(email, await hashPassword(input.newPassword));

    const [revoked] = await Promise.all([
        db().sessions.deleteByUser(email, currentSessionId),
        db().passwordResets.deleteByUser(email),
    ]);
    return revoked;
}

/**
 * Moves the account to a new email: the user document, app ownership and (by signing everything
 * out) the sessions. The caller starts a new session for the new address.
 */
export async function changeEmail(
    email: string,
    input: { email: string; password: string },
): Promise<UserRecord> {
    const user = await requireAccount(email);

    if (input.email === user.email) throw fieldError('email', 'That is already your email.');
    if (!hasPassword(user)) {
        throw fieldError('password', 'Set a password first, then you can change your email.');
    }
    if (!(await passwordMatches(user, input.password))) {
        throw fieldError('password', 'Your password is incorrect.');
    }
    if (!(await db().users.changeEmail(user.email, input.email))) {
        throw new FieldError('email', 'Another account already uses that email.', 409);
    }

    // The account has moved; move its apps with it. Retried once, because the account change above
    // already succeeded and apps left under the old address would disappear from the console.
    try {
        await db().apps.transferOwner(user.email, input.email);
    } catch (error) {
        logger.warn('Retrying app ownership transfer after an email change', { error });
        try {
            await db().apps.transferOwner(user.email, input.email);
        } catch (retryError) {
            logger.error('App ownership transfer failed after an email change; re-run it manually', {
                error: retryError,
                from: user.email,
                to: input.email,
            });
        }
    }

    await Promise.all([db().sessions.deleteByUser(user.email), db().passwordResets.deleteByUser(user.email)]);

    return { ...user, email: input.email };
}

export async function unlinkGoogle(email: string): Promise<void> {
    const user = await requireAccount(email);

    if (!user.googleSub) return;
    if (!hasPassword(user)) {
        throw badRequest("Set a password before disconnecting Google, or you won't be able to log in.");
    }

    await db().users.update(email, { googleSub: null });
}

/** Deletes the account and everything it owns: apps, leaderboards, avatar, sessions and reset links. */
export async function deleteAccount(
    email: string,
    input: { confirmEmail: string; password: string },
): Promise<void> {
    const user = await requireAccount(email);

    if (input.confirmEmail !== user.email.toLowerCase()) {
        throw fieldError('confirmEmail', 'Type your email exactly as shown to confirm.');
    }
    if (hasPassword(user) && !(await passwordMatches(user, input.password))) {
        throw fieldError('password', 'Your password is incorrect.');
    }

    const apps = await db().apps.deleteByOwner(user.email);
    await Promise.all([
        user.avatarId ? db().avatars.delete(user.avatarId) : null,
        db().passwordResets.deleteByUser(user.email),
        db().sessions.deleteByUser(user.email),
    ]);
    await db().users.delete(user.email);

    logger.info('Account deleted', { apps });
}

/* ─── Sessions ──────────────────────────────────────────────────────────────── */

/** A stable handle for a session that reveals nothing about its stored id. */
function publicSessionId(session: SessionRecord): string {
    return sha256(`session:${session.id}`).slice(0, 24);
}

function describeDevice(ua: string): Pick<ActiveSession, 'browser' | 'os' | 'device'> {
    if (!ua) return { browser: 'Unknown browser', os: 'Unknown system', device: 'other' };

    const parsed = userAgent({ headers: new Headers({ 'user-agent': ua }) });
    const type = parsed.device.type;
    const device: DeviceKind =
        type === 'mobile'
            ? 'mobile'
            : type === 'tablet'
              ? 'tablet'
              : type === undefined
                ? 'desktop'
                : 'other';

    return {
        browser: parsed.browser.name ?? (parsed.isBot ? 'Bot' : 'Unknown browser'),
        os: [parsed.os.name, parsed.os.version?.split('.')[0]].filter(Boolean).join(' ') || 'Unknown system',
        device,
    };
}

export async function listSessions(email: string, currentSessionId: string): Promise<ActiveSession[]> {
    const now = Date.now();
    const sessions = await db().sessions.listByUser(email);

    return sessions
        .filter((session) => session.expiresAt > now)
        .map((session) => ({
            id: publicSessionId(session),
            current: session.id === currentSessionId,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            ...describeDevice(session.userAgent),
        }))
        .sort((a, b) => Number(b.current) - Number(a.current) || b.createdAt - a.createdAt);
}

export async function revokeSession(
    email: string,
    currentSessionId: string,
    publicId: string,
): Promise<void> {
    const sessions = await db().sessions.listByUser(email);
    const target = sessions.find((session) => publicSessionId(session) === publicId);

    if (!target) throw notFound('That session has already ended.');
    if (target.id === currentSessionId) throw badRequest('Use "Log out" to end the session you are using.');

    await db().sessions.delete(target.id);
}

export function revokeOtherSessions(email: string, currentSessionId: string): Promise<number> {
    return db().sessions.deleteByUser(email, currentSessionId);
}
