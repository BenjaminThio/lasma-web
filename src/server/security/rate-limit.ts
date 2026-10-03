import 'server-only';
import { env, features } from '@/server/env';
import { rateLimited } from '@/server/errors';
import { logger } from '@/server/logger';

export interface RateLimitRule {
    limit: number;
    windowMs: number;
}

export interface RateLimitResult {
    ok: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

export const RATE_LIMITS = {
    loginPerIp: { limit: 20, windowMs: 15 * 60_000 },
    loginPerEmail: { limit: 8, windowMs: 15 * 60_000 },
    signUpPerIp: { limit: 6, windowMs: 60 * 60_000 },
    passwordResetPerIp: { limit: 5, windowMs: 60 * 60_000 },
    passwordResetPerEmail: { limit: 3, windowMs: 60 * 60_000 },
    oauthPerIp: { limit: 30, windowMs: 15 * 60_000 },
    accountChangesPerUser: { limit: 30, windowMs: 15 * 60_000 },
    /** Password checks on the account page (email change, deletion) — same budget as logins. */
    accountPasswordPerUser: { limit: 8, windowMs: 15 * 60_000 },
    appMutationsPerUser: { limit: 60, windowMs: 10 * 60_000 },
    apiReadPerIp: { limit: 240, windowMs: 60_000 },
    apiWritePerIpAndApp: { limit: 60, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

/* ─── In-process store ──────────────────────────────────────────────────────── */

interface Bucket {
    count: number;
    resetAt: number;
}

const MAX_BUCKETS = 50_000;

const globalForRateLimit = globalThis as typeof globalThis & { __lasmaRateLimit?: Map<string, Bucket> };
const buckets = (globalForRateLimit.__lasmaRateLimit ??= new Map<string, Bucket>());

function evictExpired(now: number): void {
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }

    // Still full (e.g. under attack): drop the oldest entries rather than growing without bound.
    if (buckets.size >= MAX_BUCKETS) {
        let excess = buckets.size - MAX_BUCKETS + 1_000;
        for (const key of buckets.keys()) {
            if (excess-- <= 0) break;
            buckets.delete(key);
        }
    }
}

function consumeLocally(key: string, rule: RateLimitRule, now: number): RateLimitResult {
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        if (buckets.size >= MAX_BUCKETS) evictExpired(now);
        bucket = { count: 0, resetAt: now + rule.windowMs };
        buckets.set(key, bucket);
    }

    bucket.count += 1;

    return {
        ok: bucket.count <= rule.limit,
        remaining: Math.max(0, rule.limit - bucket.count),
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
}

/* ─── Shared store (Upstash Redis REST) ─────────────────────────────────────── */

const REDIS_TIMEOUT_MS = 800;
let redisBackoffUntil = 0;

/**
 * Fixed window in one round trip: create the counter with its expiry if missing, increment it
 * (INCR keeps the TTL), and read the time left.
 */
async function consumeInRedis(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const redisKey = `lasma:rl:${key}`;
    const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([
            ['SET', redisKey, '0', 'PX', String(rule.windowMs), 'NX'],
            ['INCR', redisKey],
            ['PTTL', redisKey],
        ]),
        cache: 'no-store',
        signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`Upstash responded with ${response.status}`);

    const results = (await response.json()) as { result?: unknown; error?: string }[];
    const count = Number(results[1]?.result);
    const ttl = Number(results[2]?.result);

    if (!Number.isFinite(count)) throw new Error(results[1]?.error ?? 'Unexpected Upstash response');

    return {
        ok: count <= rule.limit,
        remaining: Math.max(0, rule.limit - count),
        retryAfterSeconds: Math.max(1, Math.ceil((ttl > 0 ? ttl : rule.windowMs) / 1000)),
    };
}

/**
 * Counts one hit against `key`. Uses Redis when configured so limits hold across instances; if
 * Redis is slow or down, falls back to this instance's memory for 30 seconds instead of failing
 * requests (a brief loss of precision beats an outage).
 */
export async function consume(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const now = Date.now();

    if (features.sharedRateLimit && now >= redisBackoffUntil) {
        try {
            return await consumeInRedis(key, rule);
        } catch (error) {
            redisBackoffUntil = now + 30_000;
            logger.warn('Shared rate limiter unavailable; using in-memory limits for 30s', { error });
        }
    }

    return consumeLocally(key, rule, now);
}

/** Like `consume`, but throws a 429 `AppError` when the limit is exceeded. */
export async function enforce(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const result = await consume(key, rule);
    if (!result.ok) throw rateLimited(result.retryAfterSeconds);
    return result;
}

export function describeWait(seconds: number): string {
    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}
