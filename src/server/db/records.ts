import 'server-only';
import { createHash } from 'node:crypto';
import { isAppStatus, isAppTag, PLATFORMS, type AppInfo, type Platforms } from '@/lib/domain';
import type { PlayerRecord } from './types';

/*
 * Defensive readers for stored documents. Old documents were written by client code without
 * validation, so every field is checked instead of trusted.
 */

type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as UnknownRecord)
        : {};
}

export function readString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

export function readPlatforms(value: unknown): Platforms {
    const source = asRecord(value);
    const platforms = {} as Platforms;

    for (const platform of PLATFORMS) {
        platforms[platform] = source[platform] === true;
    }

    return platforms;
}

export function readAppInfo(value: unknown): AppInfo {
    const info = asRecord(value);
    const status = Number(info.status);
    const tag = Number(info.tag);

    return {
        name: readString(info.name, 'Untitled'),
        description: readString(info.description),
        status: isAppStatus(status) ? status : 0,
        tag: isAppTag(tag) ? tag : 0,
        platforms: readPlatforms(info.platforms),
    };
}

/**
 * Converts one entry of a legacy in-document `leaderboard` (array or id-keyed map) into a player.
 * Entries without an id get a deterministic one so a re-run of the migration can't duplicate them.
 */
export function readLegacyPlayer(entry: unknown, fallbackKey: string): PlayerRecord | null {
    const source = asRecord(entry);
    const score = Number(source.score);

    if (!Number.isSafeInteger(score)) return null;

    const rawId = readString(source.id) || fallbackKey;
    const id =
        /^[A-Za-z0-9_-]{1,64}$/.test(rawId) && !/^__.*__$/.test(rawId)
            ? rawId
            : createHash('sha256')
                  .update(`${fallbackKey}:${JSON.stringify(source)}`)
                  .digest('hex')
                  .slice(0, 32);

    return {
        id,
        name: readString(source.name, 'Player').slice(0, 30) || 'Player',
        score,
        datetime: readString(source.datetime, new Date(0).toUTCString()),
    };
}
