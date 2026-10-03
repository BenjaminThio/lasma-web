'use server';

import type { ActionResult, SaveAppInput, SaveAppResult } from '@/lib/action-types';
import type { SessionUser } from '@/lib/domain';
import { getCurrentUser } from '@/server/auth/current-user';
import { unauthorized } from '@/server/errors';
import { enforce, RATE_LIMITS } from '@/server/security/rate-limit';
import {
    createApp,
    deleteApp,
    removeLeaderboardEntry,
    resetLeaderboard,
    rotateWriteKey,
    setAppVisibility,
    updateApp,
} from '@/server/services/apps';
import { appInputSchema, fieldErrors, firstIssue, identifierSchema, parseInput } from '@/server/validation';
import { runAction } from './run';

const appIdSchema = identifierSchema('appId');
const playerIdSchema = identifierSchema('playerId');

/** Every app mutation needs a signed-in user and counts against their rate limit. */
async function authorize(): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user) throw unauthorized('Your session has ended. Log in again.');

    await enforce(`apps:user:${user.email}`, RATE_LIMITS.appMutationsPerUser);
    return user;
}

export async function saveAppAction(input: SaveAppInput): Promise<ActionResult<SaveAppResult>> {
    const parsed = appInputSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: firstIssue(parsed.error), fieldErrors: fieldErrors(parsed.error) };
    }

    return runAction('saveApp', async () => {
        const user = await authorize();
        const { appId, ...fields } = parsed.data;

        if (appId) {
            await updateApp(user, appId, fields);
            return { appId, writeKey: null };
        }

        const created = await createApp(user, fields);
        return { appId: created.app.id, writeKey: created.writeKey };
    });
}

export async function setAppVisibilityAction(appId: string, isGlobal: boolean): Promise<ActionResult> {
    return runAction('setAppVisibility', async () => {
        const user = await authorize();
        await setAppVisibility(user, parseInput(appIdSchema, appId), isGlobal === true);
        return null;
    });
}

export async function rotateWriteKeyAction(appId: string): Promise<ActionResult<string>> {
    return runAction('rotateWriteKey', async () => {
        const user = await authorize();
        return rotateWriteKey(user, parseInput(appIdSchema, appId));
    });
}

export async function deleteAppAction(appId: string): Promise<ActionResult> {
    return runAction('deleteApp', async () => {
        const user = await authorize();
        await deleteApp(user, parseInput(appIdSchema, appId));
        return null;
    });
}

export async function removeLeaderboardEntryAction(appId: string, playerId: string): Promise<ActionResult> {
    return runAction('removeLeaderboardEntry', async () => {
        const user = await authorize();
        await removeLeaderboardEntry(
            user,
            parseInput(appIdSchema, appId),
            parseInput(playerIdSchema, playerId),
        );
        return null;
    });
}

export async function resetLeaderboardAction(appId: string): Promise<ActionResult> {
    return runAction('resetLeaderboard', async () => {
        const user = await authorize();
        await resetLeaderboard(user, parseInput(appIdSchema, appId));
        return null;
    });
}
