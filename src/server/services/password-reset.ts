import 'server-only';
import { containsPersonalInfo } from '@/lib/password-policy';
import { hashPassword } from '@/server/auth/password';
import { db } from '@/server/db';
import type { UserRecord } from '@/server/db/types';
import { passwordResetEmail, sendEmail } from '@/server/email';
import { fieldError } from '@/server/errors';
import { randomToken, sha256 } from '@/server/security/crypto';
import { PERSONAL_PASSWORD_MESSAGE } from '@/server/validation';
import { findAccount } from './accounts';

const RESET_TTL_MINUTES = 30;
const EXPIRED_MESSAGE = 'This reset link has expired or was already used. Request a new one.';

/**
 * Emails a single-use reset link if the account exists. Callers respond identically either way
 * (and run this after the response), so the form can't be used to discover who has an account.
 */
export async function requestPasswordReset(email: string, typedEmail: string, origin: string): Promise<void> {
    const user = await findAccount(email, typedEmail);
    if (!user) return;

    const token = randomToken(32);
    const now = Date.now();

    // Only the newest link works.
    await db().passwordResets.deleteByUser(user.email);
    await db().passwordResets.create({
        id: sha256(token),
        userId: user.email,
        createdAt: now,
        expiresAt: now + RESET_TTL_MINUTES * 60_000,
    });

    const link = `${origin}/auth/reset-password?token=${token}`;
    await sendEmail(passwordResetEmail(user.email, user.username, link, RESET_TTL_MINUTES));
}

/** For the reset page: is the link still usable? (Doesn't consume it.) */
export async function isResetTokenValid(token: string): Promise<boolean> {
    const reset = await db().passwordResets.find(sha256(token));
    return reset !== null && reset.expiresAt > Date.now();
}

/** Consumes the link, sets the password, and signs out every existing session. */
export async function resetPassword(token: string, password: string): Promise<UserRecord> {
    const id = sha256(token);
    const pending = await db().passwordResets.find(id);
    if (!pending || pending.expiresAt <= Date.now()) throw fieldError('token', EXPIRED_MESSAGE);

    const user = await db().users.findByEmail(pending.userId);
    if (!user) throw fieldError('token', EXPIRED_MESSAGE);

    // Checked before consuming the link, so a rejected password doesn't burn it.
    if (containsPersonalInfo(password, [user.username, user.email])) {
        throw fieldError('password', PERSONAL_PASSWORD_MESSAGE);
    }

    const reset = await db().passwordResets.take(id);
    if (!reset || reset.expiresAt <= Date.now()) throw fieldError('token', EXPIRED_MESSAGE);

    await db().users.setPasswordHash(user.email, await hashPassword(password));
    await Promise.all([db().sessions.deleteByUser(user.email), db().passwordResets.deleteByUser(user.email)]);

    return user;
}
