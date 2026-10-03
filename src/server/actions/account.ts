'use server';

import type { Route } from 'next';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import type {
    ActionResult,
    ChangeEmailInput,
    ChangePasswordInput,
    DeleteAccountInput,
} from '@/lib/action-types';
import { LIMITS } from '@/lib/constants';
import type { SessionUser } from '@/lib/domain';
import { getCurrentUser } from '@/server/auth/current-user';
import { clearSessionCookie, isRememberedSession, readSession, startSession } from '@/server/auth/session';
import type { SessionRecord } from '@/server/db/types';
import { FieldError, unauthorized } from '@/server/errors';
import { enforce, RATE_LIMITS } from '@/server/security/rate-limit';
import {
    changeEmail,
    changePassword,
    deleteAccount,
    revokeOtherSessions,
    revokeSession,
    unlinkGoogle,
    updateAvatar,
    updateUsername,
} from '@/server/services/accounts';
import {
    changeEmailSchema,
    changePasswordSchema,
    deleteAccountSchema,
    imageDataUrlSchema,
    usernameSchema,
} from '@/server/validation';
import { runAction } from './run';

interface Actor {
    user: SessionUser;
    session: SessionRecord;
}

/** Every account change needs a live session and counts against the user's budget. */
async function authorize(): Promise<Actor> {
    const [session, user] = await Promise.all([readSession(), getCurrentUser()]);
    if (!session || !user) throw unauthorized('Your session has ended. Log in again.');

    await enforce(`account:user:${user.email}`, RATE_LIMITS.accountChangesPerUser);
    return { user, session };
}

/** Changes that check the password get the same tight budget as logins, against guessing. */
function limitPasswordChecks(user: SessionUser) {
    return enforce(`account:password:${user.email}`, RATE_LIMITS.accountPasswordPerUser);
}

/** Parses input, reporting the first problem against its field. */
function parseFields<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (result.success) return result.data;

    const issue = result.error.issues[0];
    throw new FieldError(String(issue?.path[0] ?? 'form'), issue?.message ?? 'Check the highlighted field.');
}

const avatarSchema = imageDataUrlSchema(LIMITS.avatarBytes).nullable();

export async function updateUsernameAction(username: string): Promise<ActionResult<string>> {
    return runAction('updateUsername', async () => {
        const { user } = await authorize();
        const clean = parseFields(usernameSchema, username);

        await updateUsername(user.email, clean);
        refresh();
        return clean;
    });
}

export async function updateAvatarAction(dataUrl: string | null): Promise<ActionResult<string | null>> {
    return runAction('updateAvatar', async () => {
        const { user } = await authorize();
        const url = await updateAvatar(user.email, parseFields(avatarSchema, dataUrl));

        refresh();
        return url;
    });
}

export async function changeEmailAction(input: ChangeEmailInput): Promise<ActionResult<string>> {
    return runAction('changeEmail', async () => {
        const { user, session } = await authorize();
        const parsed = parseFields(changeEmailSchema, input);

        await limitPasswordChecks(user);
        const updated = await changeEmail(user.email, parsed);

        // Every old session was signed out; keep this browser signed in under the new address.
        await startSession(updated, isRememberedSession(session));
        return updated.email;
    });
}

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult<number>> {
    return runAction('changePassword', async () => {
        const { user, session } = await authorize();
        const parsed = parseFields(changePasswordSchema, input);

        await limitPasswordChecks(user);
        const revoked = await changePassword(user.email, session.id, parsed);

        refresh();
        return revoked;
    });
}

export async function revokeSessionAction(sessionId: string): Promise<ActionResult> {
    return runAction('revokeSession', async () => {
        const { user, session } = await authorize();
        await revokeSession(user.email, session.id, String(sessionId).slice(0, 64));

        refresh();
        return null;
    });
}

export async function revokeOtherSessionsAction(): Promise<ActionResult<number>> {
    return runAction('revokeOtherSessions', async () => {
        const { user, session } = await authorize();
        const revoked = await revokeOtherSessions(user.email, session.id);

        refresh();
        return revoked;
    });
}

export async function unlinkGoogleAction(): Promise<ActionResult> {
    return runAction('unlinkGoogle', async () => {
        const { user } = await authorize();
        await unlinkGoogle(user.email);

        refresh();
        return null;
    });
}

export async function deleteAccountAction(input: DeleteAccountInput): Promise<ActionResult> {
    return runAction('deleteAccount', async () => {
        const { user } = await authorize();
        const parsed = parseFields(deleteAccountSchema, input);

        await limitPasswordChecks(user);
        await deleteAccount(user.email, parsed);
        await clearSessionCookie();

        redirect('/?flash=account_deleted' as Route);
    });
}
