import 'server-only';
import { randomUUID } from 'node:crypto';
import { AppStatus, type Page, type Player } from '@/lib/domain';
import { decodeCursor, encodeCursor, playerCursorSchema } from '@/server/cursor';
import { db } from '@/server/db';
import type { AppWithSecrets, PlayerRecord } from '@/server/db/types';
import { forbidden, notFound, unauthorized } from '@/server/errors';
import { safeEqual, sha256 } from '@/server/security/crypto';

export async function getLeaderboardPage(
    appId: string,
    cursor: string | null,
    limit: number,
): Promise<Page<Player>> {
    const after = decodeCursor(cursor, playerCursorSchema);
    const offset = after?.n ?? 0;
    const slice = await db().players.list(appId, after ? { score: after.s, id: after.i } : null, limit);
    const last = slice.items.at(-1);

    return {
        items: slice.items.map((player, index) => ({ ...player, rank: offset + index + 1 })),
        nextCursor:
            slice.hasMore && last
                ? encodeCursor({ s: last.score, i: last.id, n: offset + slice.items.length })
                : null,
    };
}

export function countPlayers(appId: string): Promise<number> {
    return db().players.count(appId);
}

async function withRank(appId: string, player: PlayerRecord): Promise<Player> {
    const above = await db().players.countAbove(appId, player.score);
    return { ...player, rank: above + 1 };
}

/**
 * Apps created since write keys were introduced require the key for every change. Apps from before
 * have no key until the owner generates one, so existing games keep working.
 */
export function assertCanWrite(app: AppWithSecrets, providedKey: string | null): void {
    if (app.writeKeyHash !== null) {
        if (!providedKey) {
            throw unauthorized('This app requires its write key. Send it in the `X-Api-Key` header.');
        }
        if (!safeEqual(sha256(providedKey), app.writeKeyHash)) {
            throw unauthorized('The write key is not valid for this app.');
        }
    }

    if (app.info.status === AppStatus.Disabled) {
        throw forbidden('This app is disabled and is not accepting new scores.');
    }
}

export interface ScoreSubmission {
    playerId: string | null;
    name: string;
    score: number;
}

/** Creates a player, or updates the existing one when a known `playerId` is supplied. */
export async function submitScore(
    appId: string,
    submission: ScoreSubmission,
): Promise<{ player: Player; created: boolean }> {
    const record: PlayerRecord = {
        id: submission.playerId ?? randomUUID(),
        name: submission.name,
        score: submission.score,
        datetime: new Date().toUTCString(),
    };
    const fields = { name: record.name, score: record.score, datetime: record.datetime };

    if (submission.playerId && (await db().players.update(appId, record.id, fields))) {
        return { player: await withRank(appId, record), created: false };
    }

    if (await db().players.create(appId, record)) {
        return { player: await withRank(appId, record), created: true };
    }

    // Lost a race with a concurrent create for the same id: apply this submission as an update.
    await db().players.update(appId, record.id, fields);
    return { player: await withRank(appId, record), created: false };
}

export async function editPlayer(
    appId: string,
    playerId: string,
    changes: { name?: string; score?: number },
): Promise<Player> {
    const existing = await db().players.find(appId, playerId);
    if (!existing) throw notFound('Player not found.');

    const next: PlayerRecord = {
        id: playerId,
        name: changes.name ?? existing.name,
        score: changes.score ?? existing.score,
        datetime: new Date().toUTCString(),
    };

    const updated = await db().players.update(appId, playerId, {
        name: next.name,
        score: next.score,
        datetime: next.datetime,
    });
    if (!updated) throw notFound('Player not found.');

    return withRank(appId, next);
}

export async function removePlayer(appId: string, playerId: string): Promise<void> {
    const deleted = await db().players.delete(appId, playerId);
    if (!deleted) throw notFound('Player not found.');
}
