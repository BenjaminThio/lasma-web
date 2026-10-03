/*
 * Domain model shared by the server and the browser. Nothing in here may import server code.
 * Numeric codes match the values already stored in Firestore.
 */

export const AppStatus = {
    Ready: 0,
    UnderConstruction: 1,
    Disabled: 2,
} as const;
export type AppStatus = (typeof AppStatus)[keyof typeof AppStatus];

export const APP_STATUS_META: Record<AppStatus, { label: string; color: string }> = {
    [AppStatus.Ready]: { label: 'Ready', color: '#00ff7f' },
    [AppStatus.UnderConstruction]: { label: 'Under construction', color: '#ffa500' },
    [AppStatus.Disabled]: { label: 'Disabled', color: '#ff0000' },
};

export const APP_STATUSES = [AppStatus.Ready, AppStatus.UnderConstruction, AppStatus.Disabled] as const;

export const AppTag = {
    Free: 0,
    Paid: 1,
    Web: 2,
} as const;
export type AppTag = (typeof AppTag)[keyof typeof AppTag];

export const APP_TAG_LABEL: Record<AppTag, string> = {
    [AppTag.Free]: 'FREE',
    [AppTag.Paid]: 'PAID',
    [AppTag.Web]: 'WEB',
};

export const PLATFORMS = ['windows', 'linux', 'macOs', 'android'] as const;
export type Platform = (typeof PLATFORMS)[number];
export type Platforms = Record<Platform, boolean>;

export const PLATFORM_LABEL: Record<Platform, string> = {
    windows: 'Windows',
    linux: 'Linux',
    macOs: 'macOS',
    android: 'Android',
};

export const NO_PLATFORMS: Platforms = { windows: false, linux: false, macOs: false, android: false };

export interface AppInfo {
    name: string;
    description: string;
    status: AppStatus;
    tag: AppTag;
    platforms: Platforms;
}

/** What the browser is allowed to know about an app. Never includes the owner or secrets. */
export interface AppSummary {
    id: string;
    isGlobal: boolean;
    info: AppInfo;
    thumbnailUrl: string;
}

/** An app as its owner sees it in the editor. */
export interface EditableApp extends AppSummary {
    hasWriteKey: boolean;
}

export interface Player {
    id: string;
    name: string;
    score: number;
    /** RFC 7231 date string (`Date#toUTCString`), kept for API compatibility. */
    datetime: string;
    rank: number;
}

export interface SessionUser {
    email: string;
    username: string;
    /** `null` when the user hasn't uploaded one (the galaxy placeholder is shown). */
    avatarUrl: string | null;
}

export interface Page<T> {
    items: T[];
    nextCursor: string | null;
}

export function isAppStatus(value: unknown): value is AppStatus {
    return value === 0 || value === 1 || value === 2;
}

export function isAppTag(value: unknown): value is AppTag {
    return value === 0 || value === 1 || value === 2;
}

/** What the account page shows about the signed-in user. */
export interface AccountOverview {
    email: string;
    username: string;
    avatarUrl: string | null;
    createdAt: number;
    /** `false` for accounts created with Google that never set a password. */
    hasPassword: boolean;
    googleLinked: boolean;
}

export type DeviceKind = 'desktop' | 'mobile' | 'tablet' | 'other';

export interface ActiveSession {
    /** Opaque handle for revoking; not the stored session id. */
    id: string;
    current: boolean;
    createdAt: number;
    expiresAt: number;
    browser: string;
    os: string;
    device: DeviceKind;
}
