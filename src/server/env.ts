import 'server-only';
import { z } from 'zod';

/** Treats empty strings (common in .env files) as "not set". */
const optionalString = z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().optional(),
);

const optionalUrl = z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.url().optional(),
);

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATA_DRIVER: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.enum(['firestore', 'memory']).optional(),
    ),
    FIREBASE_PROJECT_ID: optionalString,
    FIREBASE_CLIENT_EMAIL: optionalString,
    FIREBASE_PRIVATE_KEY: optionalString,
    FIRESTORE_EMULATOR_HOST: optionalString,

    NEXT_PUBLIC_SITE_URL: optionalUrl,

    /** Shared rate-limit store for multi-instance deployments (Upstash Redis REST API). */
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalString,

    /** Transactional email (password resets) through Resend. */
    RESEND_API_KEY: optionalString,
    EMAIL_FROM: optionalString,

    /** "Sign in with Google" (OAuth 2.0 web client). */
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
});

export const env = envSchema.parse(process.env);

export const isProduction = env.NODE_ENV === 'production';

export type DataDriver = 'firestore' | 'memory';

/** Firestore when it is configured; the in-memory store only as a local-development fallback. */
export function resolveDataDriver(): DataDriver {
    if (env.DATA_DRIVER) return env.DATA_DRIVER;

    const hasServiceAccount = Boolean(env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
    if (hasServiceAccount || env.FIRESTORE_EMULATOR_HOST) return 'firestore';

    if (isProduction) {
        throw new Error(
            'No data store configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or DATA_DRIVER=firestore with application default credentials).',
        );
    }

    return 'memory';
}

export const features = {
    email: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    sharedRateLimit: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
} as const;

/**
 * Problems worth shouting about at boot. Nothing here stops the server; `resolveDataDriver` is the
 * only hard requirement and throws on first use.
 */
export function deploymentWarnings(): string[] {
    if (!isProduction) return [];

    const warnings: string[] = [];

    if (!env.NEXT_PUBLIC_SITE_URL) {
        warnings.push(
            'NEXT_PUBLIC_SITE_URL is not set: metadata, sitemap and OAuth redirects use localhost.',
        );
    }
    if (env.DATA_DRIVER === 'memory') {
        warnings.push('DATA_DRIVER=memory in production: every account and leaderboard is lost on restart.');
    }
    if (!features.email) {
        warnings.push('RESEND_API_KEY / EMAIL_FROM are not set: password reset emails cannot be sent.');
    }
    if (!features.sharedRateLimit) {
        warnings.push(
            'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set: rate limits are per instance.',
        );
    }
    if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
        warnings.push('Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google sign-in.');
    }

    return warnings;
}
