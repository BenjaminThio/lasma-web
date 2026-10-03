/**
 * One-off clean-up of data written by the first version of LASMA:
 *
 *   - users: hash plaintext passwords with scrypt, then delete `info.password`, `info.salt` and the
 *     old reusable `session` field
 *   - apps:  move leaderboards stored inside the app document into `apps/{id}/players`, and record
 *     whether each app has a thumbnail so listings can skip the image route for the placeholder
 *
 * The app also does both lazily (on login / first leaderboard read). Run this to fix everything
 * at once, especially the plaintext passwords.
 *
 *   bun run migrate:legacy            # dry run: only reports what would change
 *   bun run migrate:legacy --apply    # writes the changes
 *
 * Needs the same Firebase Admin environment variables as the app (loaded from .env by Bun).
 */
import { FieldValue } from 'firebase-admin/firestore';
import { hashPassword } from '@/server/auth/password';
import { getFirestoreClient } from '@/server/db/firestore/client';
import { migrateLegacyLeaderboard } from '@/server/db/firestore/legacy';
import { asRecord } from '@/server/db/records';

const apply = process.argv.includes('--apply');
const db = getFirestoreClient();

async function migrateUsers(): Promise<number> {
    const snapshot = await db.collection('users').get();
    let changed = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const info = asRecord(data.info);
        const plaintext = typeof info.password === 'string' ? info.password : null;
        const needsHash = plaintext !== null && typeof data.passwordHash !== 'string';
        const hasLeftovers = plaintext !== null || 'salt' in info || 'session' in data;

        if (!hasLeftovers) continue;
        changed += 1;

        console.info(
            `${apply ? 'Updating' : 'Would update'} user ${doc.id}${needsHash ? ' (hashing plaintext password)' : ''}`,
        );
        if (!apply) continue;

        await doc.ref.update({
            ...(needsHash && plaintext !== null ? { passwordHash: await hashPassword(plaintext) } : {}),
            'info.password': FieldValue.delete(),
            'info.salt': FieldValue.delete(),
            session: FieldValue.delete(),
        });
    }

    return changed;
}

async function backfillThumbnailFlags(): Promise<number> {
    const snapshot = await db.collection('apps').select('hasThumbnail', 'info.thumbnail').get();
    let changed = 0;

    for (const doc of snapshot.docs) {
        if (typeof doc.get('hasThumbnail') === 'boolean') continue;

        const thumbnail: unknown = doc.get('info.thumbnail');
        const hasThumbnail = typeof thumbnail === 'string' && thumbnail.startsWith('data:image/');
        changed += 1;

        console.info(`${apply ? 'Flagging' : 'Would flag'} app ${doc.id} (hasThumbnail: ${hasThumbnail})`);
        if (apply) await doc.ref.update({ hasThumbnail });
    }

    return changed;
}

async function migrateApps(): Promise<{ apps: number; players: number }> {
    const snapshot = await db.collection('apps').select('leaderboard').get();
    const result = { apps: 0, players: 0 };

    for (const doc of snapshot.docs) {
        const legacy: unknown = doc.get('leaderboard');
        if (legacy === undefined) continue;

        const count = Array.isArray(legacy) ? legacy.length : Object.keys(asRecord(legacy)).length;
        result.apps += 1;

        if (!apply) {
            console.info(`Would move ${count} player(s) out of app ${doc.id}`);
            result.players += count;
            continue;
        }

        const moved = (await migrateLegacyLeaderboard(db, doc.id)) ?? 0;
        console.info(`Moved ${moved} player(s) out of app ${doc.id}`);
        result.players += moved;
    }

    return result;
}

const users = await migrateUsers();
const apps = await migrateApps();
const flagged = await backfillThumbnailFlags();

console.info(
    `\n${apply ? 'Done' : 'Dry run'}: ${users} user(s), ${apps.apps} app(s), ${apps.players} player(s), ${flagged} thumbnail flag(s).` +
        (apply ? '' : '\nRe-run with --apply to write these changes.'),
);
process.exit(0);
