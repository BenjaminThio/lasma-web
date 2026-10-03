import 'server-only';
import type { AppInfo } from '@/lib/domain';

export interface UserRecord {
    email: string;
    username: string;
    passwordHash: string | null;
    /** Plaintext password stored by the first version of the site. Replaced by a hash on next login. */
    legacyPassword: string | null;
    avatarId: string | null;
    /** Google account id, when the user has signed in with Google. */
    googleSub: string | null;
    createdAt: number;
}

export interface NewUser {
    email: string;
    username: string;
    passwordHash: string | null;
    googleSub?: string | null;
}

export interface UserPatch {
    username?: string;
    avatarId?: string | null;
    googleSub?: string | null;
}

/** What a page needs to render the signed-in user, copied onto the session to save a read. */
export interface SessionProfile {
    username: string;
    avatarId: string | null;
}

export interface SessionRecord {
    /** SHA-256 of the session token. The raw token only ever lives in the user's cookie. */
    id: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
    /** `null` for sessions created before profile snapshots existed. */
    profile: SessionProfile | null;
    userAgent: string;
}

export interface AvatarRecord {
    id: string;
    dataUrl: string;
    createdAt: number;
}

export interface PasswordResetRecord {
    /** SHA-256 of the emailed token. */
    id: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
}

export interface AppRecord {
    id: string;
    ownerId: string;
    isGlobal: boolean;
    info: AppInfo;
    createdAt: number;
    /** Changes whenever the thumbnail changes; used to cache-bust thumbnail URLs. */
    thumbnailVersion: number;
    /** `null` for documents written before the flag existed (the thumbnail may or may not be set). */
    hasThumbnail: boolean | null;
}

export interface AppWithSecrets extends AppRecord {
    writeKeyHash: string | null;
}

export interface NewApp {
    id: string;
    ownerId: string;
    isGlobal: boolean;
    info: AppInfo;
    thumbnail: string | null;
    writeKeyHash: string;
}

export interface AppPatch {
    isGlobal?: boolean;
    info?: Partial<AppInfo>;
    thumbnail?: string | null;
    writeKeyHash?: string;
}

export interface StoredThumbnail {
    dataUrl: string | null;
    version: number;
}

export interface PlayerRecord {
    id: string;
    name: string;
    score: number;
    datetime: string;
}

export type PlayerPatch = Partial<Omit<PlayerRecord, 'id'>>;

/** Position of the last row already returned, in leaderboard order (score desc, id desc). */
export interface PlayerCursor {
    score: number;
    id: string;
}

export interface Slice<T> {
    items: T[];
    hasMore: boolean;
}

export interface UserRepository {
    findByEmail(email: string): Promise<UserRecord | null>;
    findByGoogleSub(sub: string): Promise<UserRecord | null>;
    /** Resolves `false` when the email is already registered. */
    create(user: NewUser): Promise<boolean>;
    update(email: string, patch: UserPatch): Promise<void>;
    /** Stores a new hash and wipes any legacy plaintext password or session fields. */
    setPasswordHash(email: string, passwordHash: string): Promise<void>;
    /** Moves the account to a new email (its document id). Resolves `false` when that email is taken. */
    changeEmail(from: string, to: string): Promise<boolean>;
    delete(email: string): Promise<void>;
}

export interface SessionRepository {
    create(session: SessionRecord): Promise<void>;
    find(id: string): Promise<SessionRecord | null>;
    delete(id: string): Promise<void>;
    listByUser(userId: string): Promise<SessionRecord[]>;
    /** Deletes every session of a user except `keepId`. Resolves the number removed. */
    deleteByUser(userId: string, keepId?: string): Promise<number>;
    updateProfileByUser(userId: string, profile: SessionProfile): Promise<void>;
}

export interface AvatarRepository {
    create(avatar: AvatarRecord): Promise<void>;
    find(id: string): Promise<AvatarRecord | null>;
    delete(id: string): Promise<void>;
}

export interface PasswordResetRepository {
    create(reset: PasswordResetRecord): Promise<void>;
    find(id: string): Promise<PasswordResetRecord | null>;
    /** Atomically reads and deletes a token, so each link works once. */
    take(id: string): Promise<PasswordResetRecord | null>;
    deleteByUser(userId: string): Promise<void>;
}

export interface AppRepository {
    create(app: NewApp): Promise<AppRecord>;
    find(id: string): Promise<AppRecord | null>;
    findWithSecrets(id: string): Promise<AppWithSecrets | null>;
    findThumbnail(id: string): Promise<StoredThumbnail | null>;
    update(id: string, patch: AppPatch): Promise<void>;
    /** Deletes the app and its whole leaderboard. */
    delete(id: string): Promise<void>;
    listPublic(afterId: string | null, limit: number): Promise<Slice<AppRecord>>;
    listByOwner(ownerId: string, afterId: string | null, limit: number): Promise<Slice<AppRecord>>;
    countByOwner(ownerId: string): Promise<number>;
    /** Deletes every app (and leaderboard) owned by a user. Resolves the number removed. */
    deleteByOwner(ownerId: string): Promise<number>;
    transferOwner(from: string, to: string): Promise<void>;
}

export interface PlayerRepository {
    list(appId: string, after: PlayerCursor | null, limit: number): Promise<Slice<PlayerRecord>>;
    count(appId: string): Promise<number>;
    countAbove(appId: string, score: number): Promise<number>;
    find(appId: string, playerId: string): Promise<PlayerRecord | null>;
    /** Resolves `false` when the id is already taken. */
    create(appId: string, player: PlayerRecord): Promise<boolean>;
    /** Resolves `false` when the player does not exist. */
    update(appId: string, playerId: string, patch: PlayerPatch): Promise<boolean>;
    /** Resolves `false` when the player does not exist. */
    delete(appId: string, playerId: string): Promise<boolean>;
    deleteAll(appId: string): Promise<void>;
}

export interface Repositories {
    driver: 'firestore' | 'memory';
    users: UserRepository;
    sessions: SessionRepository;
    avatars: AvatarRepository;
    passwordResets: PasswordResetRepository;
    apps: AppRepository;
    players: PlayerRepository;
}
