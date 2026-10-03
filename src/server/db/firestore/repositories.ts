import 'server-only';
import {
    FieldPath,
    FieldValue,
    Timestamp,
    type DocumentData,
    type DocumentReference,
    type Firestore,
    type Query,
    type WriteBatch,
} from 'firebase-admin/firestore';
import { logger } from '@/server/logger';
import { asRecord, readAppInfo, readString } from '../records';
import { migrateLegacyLeaderboard } from './legacy';
import type {
    AppPatch,
    AppRecord,
    AppRepository,
    AppWithSecrets,
    AvatarRecord,
    AvatarRepository,
    NewApp,
    NewUser,
    PasswordResetRecord,
    PasswordResetRepository,
    PlayerCursor,
    PlayerPatch,
    PlayerRecord,
    PlayerRepository,
    Repositories,
    SessionProfile,
    SessionRecord,
    SessionRepository,
    Slice,
    StoredThumbnail,
    UserPatch,
    UserRecord,
    UserRepository,
} from '../types';

// gRPC status codes, which the Admin SDK also uses over REST.
const NOT_FOUND = 5;
const ALREADY_EXISTS = 6;
/** Firestore allows 500 writes per commit; stay well clear of it. */
const BATCH_LIMIT = 400;

/** Fields needed to render an app anywhere. Thumbnails and secrets are deliberately excluded. */
const APP_FIELDS = [
    'ownerUUID',
    'isGlobal',
    'info.name',
    'info.description',
    'info.status',
    'info.tag',
    'info.platforms',
    'createdAt',
    'thumbnailVersion',
    'hasThumbnail',
];

function hasCode(error: unknown, code: number): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function toMillis(value: unknown): number {
    if (value instanceof Timestamp) return value.toMillis();
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Document IDs can't contain slashes or be reserved `__name__` style strings. */
function isValidDocumentId(id: string): boolean {
    return (
        id.length > 0 &&
        id.length <= 1500 &&
        !id.includes('/') &&
        !/^__.*__$/.test(id) &&
        id !== '.' &&
        id !== '..'
    );
}

/** Applies `write` to every ref, committing in batches that respect Firestore's per-commit limit. */
async function inBatches(
    db: Firestore,
    refs: DocumentReference[],
    write: (batch: WriteBatch, ref: DocumentReference) => void,
): Promise<void> {
    for (let start = 0; start < refs.length; start += BATCH_LIMIT) {
        const batch = db.batch();
        for (const ref of refs.slice(start, start + BATCH_LIMIT)) write(batch, ref);
        await batch.commit();
    }
}

/** References of every document matching `query`, without downloading any fields. */
async function refsOf(query: Query): Promise<DocumentReference[]> {
    const snapshot = await query.select().get();
    return snapshot.docs.map((doc) => doc.ref);
}

function toUserRecord(id: string, data: DocumentData): UserRecord {
    const info = asRecord(data.info);

    return {
        email: id,
        username: readString(info.username) || (id.split('@')[0] ?? id),
        passwordHash: typeof data.passwordHash === 'string' ? data.passwordHash : null,
        legacyPassword: typeof info.password === 'string' ? info.password : null,
        avatarId: typeof data.avatarId === 'string' ? data.avatarId : null,
        googleSub: typeof data.googleSub === 'string' ? data.googleSub : null,
        createdAt: toMillis(data.createdAt),
    };
}

function readProfile(value: unknown): SessionProfile | null {
    const profile = asRecord(value);
    if (typeof profile.username !== 'string') return null;

    return {
        username: profile.username,
        avatarId: typeof profile.avatarId === 'string' ? profile.avatarId : null,
    };
}

function toSessionRecord(id: string, data: DocumentData): SessionRecord {
    return {
        id,
        userId: readString(data.userId),
        createdAt: toMillis(data.createdAt),
        expiresAt: toMillis(data.expiresAt),
        profile: readProfile(data.profile),
        userAgent: readString(data.userAgent),
    };
}

function toAppRecord(id: string, data: DocumentData): AppRecord {
    return {
        id,
        ownerId: readString(data.ownerUUID),
        isGlobal: data.isGlobal === true,
        info: readAppInfo(data.info),
        createdAt: toMillis(data.createdAt),
        thumbnailVersion: toMillis(data.thumbnailVersion),
        hasThumbnail: typeof data.hasThumbnail === 'boolean' ? data.hasThumbnail : null,
    };
}

function toPlayerRecord(id: string, data: DocumentData): PlayerRecord {
    return {
        id,
        name: readString(data.name),
        score: typeof data.score === 'number' ? data.score : 0,
        datetime: readString(data.datetime),
    };
}

class FirestoreUserRepository implements UserRepository {
    constructor(private readonly db: Firestore) {}

    private get collection() {
        return this.db.collection('users');
    }

    async findByEmail(email: string): Promise<UserRecord | null> {
        if (!isValidDocumentId(email)) return null;

        const snapshot = await this.collection.doc(email).get();
        return snapshot.exists ? toUserRecord(snapshot.id, snapshot.data() ?? {}) : null;
    }

    async findByGoogleSub(sub: string): Promise<UserRecord | null> {
        const snapshot = await this.collection.where('googleSub', '==', sub).limit(1).get();
        const doc = snapshot.docs[0];
        return doc ? toUserRecord(doc.id, doc.data()) : null;
    }

    async create(user: NewUser): Promise<boolean> {
        try {
            await this.collection.doc(user.email).create({
                info: { username: user.username, email: user.email },
                passwordHash: user.passwordHash,
                avatarId: null,
                googleSub: user.googleSub ?? null,
                createdAt: Date.now(),
            });
            return true;
        } catch (error) {
            if (hasCode(error, ALREADY_EXISTS)) return false;
            throw error;
        }
    }

    async update(email: string, patch: UserPatch): Promise<void> {
        const data: Record<string, unknown> = { updatedAt: Date.now() };

        if (patch.username !== undefined) data['info.username'] = patch.username;
        if (patch.avatarId !== undefined) data.avatarId = patch.avatarId;
        if (patch.googleSub !== undefined) data.googleSub = patch.googleSub;

        await this.collection.doc(email).update(data);
    }

    async setPasswordHash(email: string, passwordHash: string): Promise<void> {
        await this.collection.doc(email).update({
            passwordHash,
            updatedAt: Date.now(),
            'info.password': FieldValue.delete(),
            'info.salt': FieldValue.delete(),
            session: FieldValue.delete(),
        });
    }

    async changeEmail(from: string, to: string): Promise<boolean> {
        if (!isValidDocumentId(to)) return false;

        const source = this.collection.doc(from);
        const target = this.collection.doc(to);

        return this.db.runTransaction(async (transaction) => {
            const [current, taken] = await transaction.getAll(source, target);
            if (!current?.exists) throw new Error('Account not found');
            if (taken?.exists) return false;

            const data = current.data() ?? {};
            transaction.create(target, {
                ...data,
                info: { ...asRecord(data.info), email: to },
                updatedAt: Date.now(),
            });
            transaction.delete(source);
            return true;
        });
    }

    async delete(email: string): Promise<void> {
        await this.collection.doc(email).delete();
    }
}

class FirestoreSessionRepository implements SessionRepository {
    constructor(private readonly db: Firestore) {}

    private get collection() {
        return this.db.collection('sessions');
    }

    async create(session: SessionRecord): Promise<void> {
        await this.collection.doc(session.id).set({
            userId: session.userId,
            createdAt: Timestamp.fromMillis(session.createdAt),
            // A Timestamp so a Firestore TTL policy on this field can purge expired sessions.
            expiresAt: Timestamp.fromMillis(session.expiresAt),
            profile: session.profile,
            userAgent: session.userAgent,
        });
    }

    async find(id: string): Promise<SessionRecord | null> {
        const snapshot = await this.collection.doc(id).get();
        return snapshot.exists ? toSessionRecord(id, snapshot.data() ?? {}) : null;
    }

    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }

    async listByUser(userId: string): Promise<SessionRecord[]> {
        const snapshot = await this.collection.where('userId', '==', userId).get();
        return snapshot.docs.map((doc) => toSessionRecord(doc.id, doc.data()));
    }

    async deleteByUser(userId: string, keepId?: string): Promise<number> {
        const refs = await refsOf(this.collection.where('userId', '==', userId));
        const doomed = refs.filter((ref) => ref.id !== keepId);

        await inBatches(this.db, doomed, (batch, ref) => batch.delete(ref));
        return doomed.length;
    }

    async updateProfileByUser(userId: string, profile: SessionProfile): Promise<void> {
        const refs = await refsOf(this.collection.where('userId', '==', userId));
        await inBatches(this.db, refs, (batch, ref) => batch.update(ref, { profile }));
    }
}

class FirestoreAvatarRepository implements AvatarRepository {
    constructor(private readonly db: Firestore) {}

    private get collection() {
        return this.db.collection('avatars');
    }

    async create(avatar: AvatarRecord): Promise<void> {
        await this.collection.doc(avatar.id).set({ dataUrl: avatar.dataUrl, createdAt: avatar.createdAt });
    }

    async find(id: string): Promise<AvatarRecord | null> {
        if (!isValidDocumentId(id)) return null;

        const snapshot = await this.collection.doc(id).get();
        const dataUrl: unknown = snapshot.get('dataUrl');
        if (!snapshot.exists || typeof dataUrl !== 'string') return null;

        return { id, dataUrl, createdAt: toMillis(snapshot.get('createdAt')) };
    }

    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }
}

class FirestorePasswordResetRepository implements PasswordResetRepository {
    constructor(private readonly db: Firestore) {}

    private get collection() {
        return this.db.collection('passwordResets');
    }

    async create(reset: PasswordResetRecord): Promise<void> {
        await this.collection.doc(reset.id).set({
            userId: reset.userId,
            createdAt: Timestamp.fromMillis(reset.createdAt),
            // A Timestamp so a TTL policy can purge links nobody used.
            expiresAt: Timestamp.fromMillis(reset.expiresAt),
        });
    }

    async find(id: string): Promise<PasswordResetRecord | null> {
        const snapshot = await this.collection.doc(id).get();
        return snapshot.exists ? this.toRecord(id, snapshot.data() ?? {}) : null;
    }

    async take(id: string): Promise<PasswordResetRecord | null> {
        const ref = this.collection.doc(id);

        return this.db.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(ref);
            if (!snapshot.exists) return null;

            transaction.delete(ref);
            return this.toRecord(id, snapshot.data() ?? {});
        });
    }

    async deleteByUser(userId: string): Promise<void> {
        const refs = await refsOf(this.collection.where('userId', '==', userId));
        await inBatches(this.db, refs, (batch, ref) => batch.delete(ref));
    }

    private toRecord(id: string, data: DocumentData): PasswordResetRecord {
        return {
            id,
            userId: readString(data.userId),
            createdAt: toMillis(data.createdAt),
            expiresAt: toMillis(data.expiresAt),
        };
    }
}

class FirestoreAppRepository implements AppRepository {
    constructor(private readonly db: Firestore) {}

    private get collection() {
        return this.db.collection('apps');
    }

    async create(app: NewApp): Promise<AppRecord> {
        const now = Date.now();

        await this.collection.doc(app.id).create({
            ownerUUID: app.ownerId,
            isGlobal: app.isGlobal,
            info: { ...app.info, category: '', thumbnail: app.thumbnail },
            writeKeyHash: app.writeKeyHash,
            createdAt: now,
            updatedAt: now,
            thumbnailVersion: now,
            hasThumbnail: app.thumbnail !== null,
        });

        return {
            id: app.id,
            ownerId: app.ownerId,
            isGlobal: app.isGlobal,
            info: app.info,
            createdAt: now,
            thumbnailVersion: now,
            hasThumbnail: app.thumbnail !== null,
        };
    }

    async find(id: string): Promise<AppRecord | null> {
        if (!isValidDocumentId(id)) return null;

        const [snapshot] = await this.db.getAll(this.collection.doc(id), { fieldMask: APP_FIELDS });
        return snapshot?.exists ? toAppRecord(snapshot.id, snapshot.data() ?? {}) : null;
    }

    async findWithSecrets(id: string): Promise<AppWithSecrets | null> {
        if (!isValidDocumentId(id)) return null;

        const [snapshot] = await this.db.getAll(this.collection.doc(id), {
            fieldMask: [...APP_FIELDS, 'writeKeyHash'],
        });
        if (!snapshot?.exists) return null;

        const data = snapshot.data() ?? {};
        return {
            ...toAppRecord(snapshot.id, data),
            writeKeyHash: typeof data.writeKeyHash === 'string' ? data.writeKeyHash : null,
        };
    }

    async findThumbnail(id: string): Promise<StoredThumbnail | null> {
        if (!isValidDocumentId(id)) return null;

        const [snapshot] = await this.db.getAll(this.collection.doc(id), {
            fieldMask: ['info.thumbnail', 'thumbnailVersion'],
        });
        if (!snapshot?.exists) return null;

        const dataUrl: unknown = snapshot.get('info.thumbnail');
        return {
            dataUrl: typeof dataUrl === 'string' ? dataUrl : null,
            version: toMillis(snapshot.get('thumbnailVersion')),
        };
    }

    async update(id: string, patch: AppPatch): Promise<void> {
        const now = Date.now();
        const data: Record<string, unknown> = { updatedAt: now };

        if (patch.isGlobal !== undefined) data.isGlobal = patch.isGlobal;
        if (patch.writeKeyHash !== undefined) data.writeKeyHash = patch.writeKeyHash;
        if (patch.thumbnail !== undefined) {
            data['info.thumbnail'] = patch.thumbnail;
            data.thumbnailVersion = now;
            data.hasThumbnail = patch.thumbnail !== null;
        }
        for (const [field, value] of Object.entries(patch.info ?? {})) {
            if (value !== undefined) data[`info.${field}`] = value;
        }

        await this.collection.doc(id).update(data);
    }

    async delete(id: string): Promise<void> {
        await this.db.recursiveDelete(this.collection.doc(id));
    }

    listPublic(afterId: string | null, limit: number): Promise<Slice<AppRecord>> {
        return this.slice(this.collection.where('isGlobal', '==', true), afterId, limit);
    }

    listByOwner(ownerId: string, afterId: string | null, limit: number): Promise<Slice<AppRecord>> {
        return this.slice(this.collection.where('ownerUUID', '==', ownerId), afterId, limit);
    }

    async countByOwner(ownerId: string): Promise<number> {
        const snapshot = await this.collection.where('ownerUUID', '==', ownerId).count().get();
        return snapshot.data().count;
    }

    async deleteByOwner(ownerId: string): Promise<number> {
        const refs = await refsOf(this.collection.where('ownerUUID', '==', ownerId));
        // One at a time: each recursive delete already fans out its own writes.
        for (const ref of refs) await this.db.recursiveDelete(ref);
        return refs.length;
    }

    async transferOwner(from: string, to: string): Promise<void> {
        const refs = await refsOf(this.collection.where('ownerUUID', '==', from));
        const updatedAt = Date.now();
        await inBatches(this.db, refs, (batch, ref) => batch.update(ref, { ownerUUID: to, updatedAt }));
    }

    /** Equality filter + document-id order is served by automatic indexes — no composite index needed. */
    private async slice(query: Query, afterId: string | null, limit: number): Promise<Slice<AppRecord>> {
        let paged = query
            .orderBy(FieldPath.documentId())
            .select(...APP_FIELDS)
            .limit(limit + 1);

        if (afterId) paged = paged.startAfter(afterId);

        const snapshot = await paged.get();
        return {
            items: snapshot.docs.slice(0, limit).map((doc) => toAppRecord(doc.id, doc.data())),
            hasMore: snapshot.size > limit,
        };
    }
}

class FirestorePlayerRepository implements PlayerRepository {
    /** Apps whose legacy in-document leaderboard has already been moved (per server process). */
    private readonly migratedApps = new Set<string>();

    constructor(private readonly db: Firestore) {}

    private players(appId: string) {
        return this.db.collection('apps').doc(appId).collection('players');
    }

    async list(appId: string, after: PlayerCursor | null, limit: number): Promise<Slice<PlayerRecord>> {
        await this.migrateLegacyLeaderboard(appId);

        // Same ordering the single-field `score` index already provides, so no composite index is needed.
        let query = this.players(appId)
            .orderBy('score', 'desc')
            .orderBy(FieldPath.documentId(), 'desc')
            .limit(limit + 1);

        if (after) query = query.startAfter(after.score, after.id);

        const snapshot = await query.get();
        return {
            items: snapshot.docs.slice(0, limit).map((doc) => toPlayerRecord(doc.id, doc.data())),
            hasMore: snapshot.size > limit,
        };
    }

    async count(appId: string): Promise<number> {
        await this.migrateLegacyLeaderboard(appId);
        const snapshot = await this.players(appId).count().get();
        return snapshot.data().count;
    }

    async countAbove(appId: string, score: number): Promise<number> {
        await this.migrateLegacyLeaderboard(appId);
        const snapshot = await this.players(appId).where('score', '>', score).count().get();
        return snapshot.data().count;
    }

    async find(appId: string, playerId: string): Promise<PlayerRecord | null> {
        if (!isValidDocumentId(playerId)) return null;

        await this.migrateLegacyLeaderboard(appId);
        const snapshot = await this.players(appId).doc(playerId).get();
        return snapshot.exists ? toPlayerRecord(snapshot.id, snapshot.data() ?? {}) : null;
    }

    async create(appId: string, player: PlayerRecord): Promise<boolean> {
        await this.migrateLegacyLeaderboard(appId);
        try {
            await this.players(appId).doc(player.id).create({
                name: player.name,
                score: player.score,
                datetime: player.datetime,
                updatedAt: Date.now(),
            });
            return true;
        } catch (error) {
            if (hasCode(error, ALREADY_EXISTS)) return false;
            throw error;
        }
    }

    async update(appId: string, playerId: string, patch: PlayerPatch): Promise<boolean> {
        await this.migrateLegacyLeaderboard(appId);
        try {
            await this.players(appId)
                .doc(playerId)
                .update({ ...patch, updatedAt: Date.now() });
            return true;
        } catch (error) {
            if (hasCode(error, NOT_FOUND)) return false;
            throw error;
        }
    }

    async delete(appId: string, playerId: string): Promise<boolean> {
        if (!isValidDocumentId(playerId)) return false;

        await this.migrateLegacyLeaderboard(appId);
        try {
            await this.players(appId).doc(playerId).delete({ exists: true });
            return true;
        } catch (error) {
            if (hasCode(error, NOT_FOUND)) return false;
            throw error;
        }
    }

    async deleteAll(appId: string): Promise<void> {
        // Migrating first also clears any legacy in-document board, so old rows can't come back.
        await this.migrateLegacyLeaderboard(appId);
        await this.db.recursiveDelete(this.players(appId));
    }

    /** Moves an app's legacy in-document leaderboard the first time it is touched (see `legacy.ts`). */
    private async migrateLegacyLeaderboard(appId: string): Promise<void> {
        if (this.migratedApps.has(appId)) return;

        const moved = await migrateLegacyLeaderboard(this.db, appId);
        if (moved !== null)
            logger.info('Migrated legacy leaderboard to sub-collection', { appId, players: moved });

        this.migratedApps.add(appId);
    }
}

export function createFirestoreRepositories(db: Firestore): Repositories {
    return {
        driver: 'firestore',
        users: new FirestoreUserRepository(db),
        sessions: new FirestoreSessionRepository(db),
        avatars: new FirestoreAvatarRepository(db),
        passwordResets: new FirestorePasswordResetRepository(db),
        apps: new FirestoreAppRepository(db),
        players: new FirestorePlayerRepository(db),
    };
}
