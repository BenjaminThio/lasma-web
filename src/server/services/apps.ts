import 'server-only';
import { randomUUID } from 'node:crypto';
import { cache } from 'react';
import type { AppInfo, AppSummary, EditableApp, Page, SessionUser } from '@/lib/domain';
import { appCursorSchema, decodeCursor, encodeCursor } from '@/server/cursor';
import { getCurrentUser } from '@/server/auth/current-user';
import { db } from '@/server/db';
import type { AppRecord, Slice } from '@/server/db/types';
import { notFound } from '@/server/errors';
import { randomToken, sha256 } from '@/server/security/crypto';
import { processImageUpload } from './images';

export interface AppInput {
    name: string;
    description: string;
    status: AppInfo['status'];
    tag: AppInfo['tag'];
    platforms: AppInfo['platforms'];
    /** New image as a data URL; omit to keep the current one. */
    thumbnail?: string;
}

/** Served as a static file, so every app without an image shares one cached download. */
export const PLACEHOLDER_THUMBNAIL = '/images/galaxy.webp';

export function thumbnailUrl(app: Pick<AppRecord, 'id' | 'thumbnailVersion' | 'hasThumbnail'>): string {
    if (app.hasThumbnail === false) return PLACEHOLDER_THUMBNAIL;
    return `/api/apps/${encodeURIComponent(app.id)}/thumbnail?v=${app.thumbnailVersion}`;
}

export function toAppSummary(app: AppRecord): AppSummary {
    return { id: app.id, isGlobal: app.isGlobal, info: app.info, thumbnailUrl: thumbnailUrl(app) };
}

function toPage(slice: Slice<AppRecord>): Page<AppSummary> {
    const last = slice.items.at(-1);

    return {
        items: slice.items.map(toAppSummary),
        nextCursor: slice.hasMore && last ? encodeCursor({ i: last.id }) : null,
    };
}

/** Write keys are shown to the owner once; only their hash is stored. */
function generateWriteKey(): { key: string; hash: string } {
    const key = `lsk_${randomToken(32)}`;
    return { key, hash: sha256(key) };
}

/** Memoized per request so `generateMetadata` and the page share one read. */
export const findApp = cache((appId: string) => db().apps.find(appId));

export async function listPublicApps(cursor: string | null, limit: number): Promise<Page<AppSummary>> {
    const after = decodeCursor(cursor, appCursorSchema);
    return toPage(await db().apps.listPublic(after?.i ?? null, limit));
}

export async function listOwnedApps(
    owner: SessionUser,
    cursor: string | null,
    limit: number,
): Promise<Page<AppSummary>> {
    const after = decodeCursor(cursor, appCursorSchema);
    return toPage(await db().apps.listByOwner(owner.email, after?.i ?? null, limit));
}

export function countOwnedApps(owner: SessionUser): Promise<number> {
    return db().apps.countByOwner(owner.email);
}

/** Public apps are visible to everyone; private apps only to their owner. */
export function canView(app: AppRecord | null, viewer: SessionUser | null): app is AppRecord {
    return app !== null && (app.isGlobal || app.ownerId === viewer?.email);
}

/** The app and the signed-in user, read in parallel. `app` is `null` when the viewer may not see it. */
export async function getViewableAppForRequest(
    appId: string,
): Promise<{ app: AppRecord | null; viewer: SessionUser | null }> {
    const [viewer, app] = await Promise.all([getCurrentUser(), findApp(appId)]);
    return { viewer, app: canView(app, viewer) ? app : null };
}

/** Someone else's app is reported as "not found" so app IDs can't be probed for existence. */
export async function requireOwnedApp(owner: SessionUser, appId: string) {
    const app = await db().apps.findWithSecrets(appId);
    if (!app || app.ownerId !== owner.email) throw notFound('App not found.');
    return app;
}

/** The editor's view of an app, or `null` when it doesn't exist or belongs to someone else. */
export async function getEditableApp(
    ownerPromise: Promise<SessionUser>,
    appId: string,
): Promise<EditableApp | null> {
    // The session and the app are independent reads, so they run in parallel.
    const [owner, app] = await Promise.all([ownerPromise, db().apps.findWithSecrets(appId)]);
    if (!app || app.ownerId !== owner.email) return null;
    return { ...toAppSummary(app), hasWriteKey: app.writeKeyHash !== null };
}

export async function createApp(
    owner: SessionUser,
    input: AppInput,
): Promise<{ app: AppRecord; writeKey: string }> {
    const writeKey = generateWriteKey();
    const app = await db().apps.create({
        id: randomUUID(),
        ownerId: owner.email,
        isGlobal: true,
        info: {
            name: input.name,
            description: input.description,
            status: input.status,
            tag: input.tag,
            platforms: input.platforms,
        },
        thumbnail: input.thumbnail ? await processImageUpload(input.thumbnail, 'thumbnail') : null,
        writeKeyHash: writeKey.hash,
    });

    return { app, writeKey: writeKey.key };
}

export async function updateApp(owner: SessionUser, appId: string, input: AppInput): Promise<void> {
    await requireOwnedApp(owner, appId);

    await db().apps.update(appId, {
        info: {
            name: input.name,
            description: input.description,
            status: input.status,
            tag: input.tag,
            platforms: input.platforms,
        },
        ...(input.thumbnail ? { thumbnail: await processImageUpload(input.thumbnail, 'thumbnail') } : {}),
    });
}

export async function setAppVisibility(owner: SessionUser, appId: string, isGlobal: boolean): Promise<void> {
    await requireOwnedApp(owner, appId);
    await db().apps.update(appId, { isGlobal });
}

export async function rotateWriteKey(owner: SessionUser, appId: string): Promise<string> {
    await requireOwnedApp(owner, appId);

    const writeKey = generateWriteKey();
    await db().apps.update(appId, { writeKeyHash: writeKey.hash });
    return writeKey.key;
}

export async function deleteApp(owner: SessionUser, appId: string): Promise<void> {
    await requireOwnedApp(owner, appId);
    await db().apps.delete(appId);
}

/** Owner moderation: removes one row from the app's leaderboard. */
export async function removeLeaderboardEntry(
    owner: SessionUser,
    appId: string,
    playerId: string,
): Promise<void> {
    await requireOwnedApp(owner, appId);
    if (!(await db().players.delete(appId, playerId))) throw notFound('That player is already gone.');
}

/** Owner moderation: wipes every row from the app's leaderboard (the app and its keys stay). */
export async function resetLeaderboard(owner: SessionUser, appId: string): Promise<void> {
    await requireOwnedApp(owner, appId);
    await db().players.deleteAll(appId);
}
