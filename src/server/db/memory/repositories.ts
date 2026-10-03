import 'server-only';
import { createSeedData } from './seed';
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

/*
 * In-memory store for local development without Firebase credentials. It mirrors the Firestore
 * adapter's behaviour (ordering, paging, not-found semantics) so the app behaves the same.
 * Data lives on `globalThis` so it survives hot reloads, and resets when the server restarts.
 */

interface StoredApp {
    record: AppRecord;
    thumbnail: string | null;
    writeKeyHash: string | null;
}

interface MemoryState {
    users: Map<string, UserRecord>;
    sessions: Map<string, SessionRecord>;
    avatars: Map<string, AvatarRecord>;
    passwordResets: Map<string, PasswordResetRecord>;
    apps: Map<string, StoredApp>;
    players: Map<string, Map<string, PlayerRecord>>;
}

const globalForMemory = globalThis as typeof globalThis & { __lasmaMemoryState?: MemoryState };

function getState(): MemoryState {
    if (!globalForMemory.__lasmaMemoryState) {
        const seed = createSeedData();
        globalForMemory.__lasmaMemoryState = {
            users: new Map(),
            sessions: new Map(),
            avatars: new Map(),
            passwordResets: new Map(),
            apps: new Map(
                seed.apps.map((record) => [record.id, { record, thumbnail: null, writeKeyHash: null }]),
            ),
            players: new Map(
                [...seed.players].map(([appId, list]) => [
                    appId,
                    new Map(list.map((player) => [player.id, player])),
                ]),
            ),
        };
    }
    return globalForMemory.__lasmaMemoryState;
}

const clone = <T>(value: T): T => structuredClone(value);

function sliceById<T extends { id: string }>(items: T[], afterId: string | null, limit: number): Slice<T> {
    const sorted = items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const start = afterId === null ? 0 : sorted.findIndex((item) => item.id > afterId);
    const from = start === -1 ? sorted.length : start;
    const page = sorted.slice(from, from + limit + 1);

    return { items: page.slice(0, limit).map(clone), hasMore: page.length > limit };
}

function comparePlayers(a: PlayerCursor, b: PlayerCursor): number {
    if (a.score !== b.score) return b.score - a.score;
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/** Deletes every entry matching `predicate`. Resolves the number removed. */
function deleteWhere<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => boolean): number {
    let removed = 0;
    for (const [key, value] of map) {
        if (predicate(value, key)) {
            map.delete(key);
            removed += 1;
        }
    }
    return removed;
}

class MemoryUserRepository implements UserRepository {
    async findByEmail(email: string): Promise<UserRecord | null> {
        const user = getState().users.get(email);
        return user ? clone(user) : null;
    }

    async findByGoogleSub(sub: string): Promise<UserRecord | null> {
        for (const user of getState().users.values()) {
            if (user.googleSub === sub) return clone(user);
        }
        return null;
    }

    async create(user: NewUser): Promise<boolean> {
        const { users } = getState();
        if (users.has(user.email)) return false;

        users.set(user.email, {
            email: user.email,
            username: user.username,
            passwordHash: user.passwordHash,
            legacyPassword: null,
            avatarId: null,
            googleSub: user.googleSub ?? null,
            createdAt: Date.now(),
        });
        return true;
    }

    async update(email: string, patch: UserPatch): Promise<void> {
        const user = getState().users.get(email);
        if (!user) throw new Error('Account not found');

        if (patch.username !== undefined) user.username = patch.username;
        if (patch.avatarId !== undefined) user.avatarId = patch.avatarId;
        if (patch.googleSub !== undefined) user.googleSub = patch.googleSub;
    }

    async setPasswordHash(email: string, passwordHash: string): Promise<void> {
        const user = getState().users.get(email);
        if (user) Object.assign(user, { passwordHash, legacyPassword: null });
    }

    async changeEmail(from: string, to: string): Promise<boolean> {
        const { users } = getState();
        const user = users.get(from);

        if (!user) throw new Error('Account not found');
        if (users.has(to)) return false;

        users.delete(from);
        users.set(to, { ...user, email: to });
        return true;
    }

    async delete(email: string): Promise<void> {
        getState().users.delete(email);
    }
}

class MemorySessionRepository implements SessionRepository {
    async create(session: SessionRecord): Promise<void> {
        getState().sessions.set(session.id, clone(session));
    }

    async find(id: string): Promise<SessionRecord | null> {
        const session = getState().sessions.get(id);
        return session ? clone(session) : null;
    }

    async delete(id: string): Promise<void> {
        getState().sessions.delete(id);
    }

    async listByUser(userId: string): Promise<SessionRecord[]> {
        return [...getState().sessions.values()].filter((session) => session.userId === userId).map(clone);
    }

    async deleteByUser(userId: string, keepId?: string): Promise<number> {
        return deleteWhere(
            getState().sessions,
            (session) => session.userId === userId && session.id !== keepId,
        );
    }

    async updateProfileByUser(userId: string, profile: SessionProfile): Promise<void> {
        for (const session of getState().sessions.values()) {
            if (session.userId === userId) session.profile = { ...profile };
        }
    }
}

class MemoryAvatarRepository implements AvatarRepository {
    async create(avatar: AvatarRecord): Promise<void> {
        getState().avatars.set(avatar.id, { ...avatar });
    }

    async find(id: string): Promise<AvatarRecord | null> {
        const avatar = getState().avatars.get(id);
        return avatar ? { ...avatar } : null;
    }

    async delete(id: string): Promise<void> {
        getState().avatars.delete(id);
    }
}

class MemoryPasswordResetRepository implements PasswordResetRepository {
    async create(reset: PasswordResetRecord): Promise<void> {
        getState().passwordResets.set(reset.id, { ...reset });
    }

    async find(id: string): Promise<PasswordResetRecord | null> {
        const reset = getState().passwordResets.get(id);
        return reset ? { ...reset } : null;
    }

    async take(id: string): Promise<PasswordResetRecord | null> {
        const { passwordResets } = getState();
        const reset = passwordResets.get(id);
        if (!reset) return null;

        passwordResets.delete(id);
        return reset;
    }

    async deleteByUser(userId: string): Promise<void> {
        deleteWhere(getState().passwordResets, (reset) => reset.userId === userId);
    }
}

class MemoryAppRepository implements AppRepository {
    async create(app: NewApp): Promise<AppRecord> {
        const now = Date.now();
        const record: AppRecord = {
            id: app.id,
            ownerId: app.ownerId,
            isGlobal: app.isGlobal,
            info: clone(app.info),
            createdAt: now,
            thumbnailVersion: now,
            hasThumbnail: app.thumbnail !== null,
        };

        getState().apps.set(app.id, { record, thumbnail: app.thumbnail, writeKeyHash: app.writeKeyHash });
        return clone(record);
    }

    async find(id: string): Promise<AppRecord | null> {
        const stored = getState().apps.get(id);
        return stored ? clone(stored.record) : null;
    }

    async findWithSecrets(id: string): Promise<AppWithSecrets | null> {
        const stored = getState().apps.get(id);
        return stored ? { ...clone(stored.record), writeKeyHash: stored.writeKeyHash } : null;
    }

    async findThumbnail(id: string): Promise<StoredThumbnail | null> {
        const stored = getState().apps.get(id);
        return stored ? { dataUrl: stored.thumbnail, version: stored.record.thumbnailVersion } : null;
    }

    async update(id: string, patch: AppPatch): Promise<void> {
        const stored = getState().apps.get(id);
        if (!stored) throw new Error(`App ${id} not found`);

        if (patch.isGlobal !== undefined) stored.record.isGlobal = patch.isGlobal;
        if (patch.writeKeyHash !== undefined) stored.writeKeyHash = patch.writeKeyHash;
        if (patch.info) stored.record.info = { ...stored.record.info, ...clone(patch.info) };
        if (patch.thumbnail !== undefined) {
            stored.thumbnail = patch.thumbnail;
            stored.record.thumbnailVersion = Date.now();
            stored.record.hasThumbnail = patch.thumbnail !== null;
        }
    }

    async delete(id: string): Promise<void> {
        const state = getState();
        state.apps.delete(id);
        state.players.delete(id);
    }

    async listPublic(afterId: string | null, limit: number): Promise<Slice<AppRecord>> {
        return sliceById(
            this.records((app) => app.record.isGlobal),
            afterId,
            limit,
        );
    }

    async listByOwner(ownerId: string, afterId: string | null, limit: number): Promise<Slice<AppRecord>> {
        return sliceById(
            this.records((app) => app.record.ownerId === ownerId),
            afterId,
            limit,
        );
    }

    async countByOwner(ownerId: string): Promise<number> {
        let count = 0;
        for (const app of getState().apps.values()) {
            if (app.record.ownerId === ownerId) count += 1;
        }
        return count;
    }

    async deleteByOwner(ownerId: string): Promise<number> {
        const { apps, players } = getState();
        return deleteWhere(apps, (app, id) => {
            if (app.record.ownerId !== ownerId) return false;
            players.delete(id);
            return true;
        });
    }

    async transferOwner(from: string, to: string): Promise<void> {
        for (const app of getState().apps.values()) {
            if (app.record.ownerId === from) app.record.ownerId = to;
        }
    }

    private records(predicate: (app: StoredApp) => boolean): AppRecord[] {
        const records: AppRecord[] = [];
        for (const app of getState().apps.values()) {
            if (predicate(app)) records.push(app.record);
        }
        return records;
    }
}

class MemoryPlayerRepository implements PlayerRepository {
    private board(appId: string): Map<string, PlayerRecord> {
        const { players } = getState();
        let board = players.get(appId);

        if (!board) {
            board = new Map();
            players.set(appId, board);
        }
        return board;
    }

    async list(appId: string, after: PlayerCursor | null, limit: number): Promise<Slice<PlayerRecord>> {
        const sorted = [...this.board(appId).values()].sort(comparePlayers);
        const start = after ? sorted.findIndex((player) => comparePlayers(player, after) > 0) : 0;
        const from = start === -1 ? sorted.length : start;
        const page = sorted.slice(from, from + limit + 1);

        return { items: page.slice(0, limit).map(clone), hasMore: page.length > limit };
    }

    async count(appId: string): Promise<number> {
        return this.board(appId).size;
    }

    async countAbove(appId: string, score: number): Promise<number> {
        let count = 0;
        for (const player of this.board(appId).values()) {
            if (player.score > score) count += 1;
        }
        return count;
    }

    async find(appId: string, playerId: string): Promise<PlayerRecord | null> {
        const player = this.board(appId).get(playerId);
        return player ? clone(player) : null;
    }

    async create(appId: string, player: PlayerRecord): Promise<boolean> {
        const board = this.board(appId);
        if (board.has(player.id)) return false;

        board.set(player.id, clone(player));
        return true;
    }

    async update(appId: string, playerId: string, patch: PlayerPatch): Promise<boolean> {
        const player = this.board(appId).get(playerId);
        if (!player) return false;

        Object.assign(player, patch);
        return true;
    }

    async delete(appId: string, playerId: string): Promise<boolean> {
        return this.board(appId).delete(playerId);
    }

    async deleteAll(appId: string): Promise<void> {
        getState().players.delete(appId);
    }
}

export function createMemoryRepositories(): Repositories {
    return {
        driver: 'memory',
        users: new MemoryUserRepository(),
        sessions: new MemorySessionRepository(),
        avatars: new MemoryAvatarRepository(),
        passwordResets: new MemoryPasswordResetRepository(),
        apps: new MemoryAppRepository(),
        players: new MemoryPlayerRepository(),
    };
}
