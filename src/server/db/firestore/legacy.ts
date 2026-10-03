import 'server-only';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { asRecord, readLegacyPlayer } from '../records';

const BATCH_LIMIT = 400;

/**
 * The first version of the site stored every player inside the app document (an array, or an
 * id-keyed map), which capped boards at 1 MiB and forced a full download on every read. This moves
 * those entries into the `apps/{appId}/players` sub-collection and removes the old field.
 *
 * Idempotent: player ids are stable, so running it twice rewrites the same documents.
 * Resolves the number of players moved, or `null` when the app had nothing to migrate.
 */
export async function migrateLegacyLeaderboard(db: Firestore, appId: string): Promise<number | null> {
    const appRef = db.collection('apps').doc(appId);
    const [snapshot] = await db.getAll(appRef, { fieldMask: ['leaderboard'] });
    const legacy: unknown = snapshot?.exists ? snapshot.get('leaderboard') : undefined;

    if (legacy === undefined) return null;

    const entries: [string, unknown][] = Array.isArray(legacy)
        ? legacy.map((entry, index) => [`legacy-${index}`, entry])
        : Object.entries(asRecord(legacy));
    const players = appRef.collection('players');

    let batch = db.batch();
    let pending = 0;
    let moved = 0;

    for (const [key, entry] of entries) {
        const player = readLegacyPlayer(entry, key);
        if (!player) continue;

        batch.set(players.doc(player.id), {
            name: player.name,
            score: player.score,
            datetime: player.datetime,
            updatedAt: Date.now(),
        });
        moved += 1;
        pending += 1;

        if (pending === BATCH_LIMIT) {
            await batch.commit();
            batch = db.batch();
            pending = 0;
        }
    }

    batch.update(appRef, { leaderboard: FieldValue.delete() });
    await batch.commit();

    return moved;
}
