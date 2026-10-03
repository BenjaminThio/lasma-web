import 'server-only';
import { z } from 'zod';
import { LIMITS } from '@/lib/constants';
import { APP_STATUSES, PLATFORMS, type AppStatus, type AppTag, type Platforms } from '@/lib/domain';
import { containsPersonalInfo, isCommonPassword } from '@/lib/password-policy';
import { badRequest } from '@/server/errors';

// Control characters, zero-width characters and bidi overrides (used to spoof names on boards).
const INVISIBLE_RANGES: ReadonlyArray<readonly [number, number]> = [
    [0x0000, 0x001f],
    [0x007f, 0x009f],
    [0x200b, 0x200f],
    [0x202a, 0x202e],
    [0x2060, 0x2064],
    [0x2066, 0x206f],
    [0xfeff, 0xfeff],
];
const INVISIBLE_CHARACTERS = new RegExp(
    `[${INVISIBLE_RANGES.map(([from, to]) => `${String.fromCharCode(from)}-${String.fromCharCode(to)}`).join('')}]`,
    'g',
);

export function cleanText(value: string): string {
    return value.normalize('NFC').replace(INVISIBLE_CHARACTERS, '').replace(/\s+/g, ' ').trim();
}

function text(label: string, max: number) {
    return z
        .string({ error: `${label} is required.` })
        .transform(cleanText)
        .pipe(
            z
                .string()
                .min(1, `${label} is required.`)
                .max(max, `${label} must be ${max} characters or fewer.`),
        );
}

const IDENTIFIER = /^[A-Za-z0-9_-]+$/;

export function identifierSchema(label: string) {
    return z
        .string({ error: `The \`${label}\` argument is not provided.` })
        .trim()
        .min(1, `The \`${label}\` argument is not provided.`)
        .max(LIMITS.identifier, `The \`${label}\` argument is invalid.`)
        .regex(IDENTIFIER, `The \`${label}\` argument is invalid.`)
        .refine((value) => !/^__.*__$/.test(value), `The \`${label}\` argument is invalid.`);
}

/* ─── Accounts ──────────────────────────────────────────────────────────────── */

export const emailSchema = z
    .string({ error: 'Enter your email address.' })
    .trim()
    .toLowerCase()
    .max(LIMITS.email, 'That email address is too long.')
    .pipe(z.email('Enter a valid email address.'));

export const usernameSchema = text('Username', LIMITS.username);

/** Any password the user already has: only bounded, never judged (old accounts predate the rules). */
const existingPasswordSchema = z
    .string()
    .min(1, 'Enter your password.')
    .max(LIMITS.passwordMax, 'That password is too long.');

/** Length is counted in characters (code points), matching the hint shown in the form. */
export const newPasswordSchema = z
    .string({ error: 'Choose a password.' })
    .refine(
        (value) => Array.from(value).length >= LIMITS.passwordMin,
        `Use at least ${LIMITS.passwordMin} characters.`,
    )
    .refine(
        (value) => Array.from(value).length <= LIMITS.passwordMax,
        `Use ${LIMITS.passwordMax} characters or fewer.`,
    )
    .refine(
        (value) => !isCommonPassword(value),
        'That password is too easy to guess. Try something less common.',
    );

export const PERSONAL_PASSWORD_MESSAGE = "Don't include your username or email in your password.";

export const logInSchema = z.object({
    email: emailSchema,
    password: existingPasswordSchema,
    remember: z.boolean(),
});

export const signUpSchema = z
    .object({
        username: usernameSchema,
        email: emailSchema,
        password: newPasswordSchema,
        remember: z.boolean(),
    })
    .refine((value) => !containsPersonalInfo(value.password, [value.username, value.email]), {
        message: PERSONAL_PASSWORD_MESSAGE,
        path: ['password'],
    });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, 'This reset link is not valid.');

export const resetPasswordSchema = z
    .object({
        token: resetTokenSchema,
        password: newPasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((value) => value.password === value.confirmPassword, {
        message: "The passwords don't match.",
        path: ['confirmPassword'],
    });

export const changeEmailSchema = z.object({
    email: emailSchema,
    password: existingPasswordSchema,
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().max(LIMITS.passwordMax, 'That password is too long.'),
        newPassword: newPasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
        message: "The passwords don't match.",
        path: ['confirmPassword'],
    });

export const deleteAccountSchema = z.object({
    confirmEmail: z.string().trim().toLowerCase().max(LIMITS.email),
    password: z.string().max(LIMITS.passwordMax, 'That password is too long.'),
});

/** Rough cap before decoding; the exact byte limit is checked when the image is processed. */
export function imageDataUrlSchema(maxBytes: number) {
    return z.string().max(Math.ceil(maxBytes * 1.37) + 64, 'That image is too large.');
}

/* ─── Apps ──────────────────────────────────────────────────────────────────── */

export const appStatusSchema = z.custom<AppStatus>(
    (value) => (APP_STATUSES as readonly unknown[]).includes(value),
    'Pick a valid status.',
);

export const appTagSchema = z.custom<AppTag>(
    (value) => value === 0 || value === 1 || value === 2,
    'Pick a valid tag.',
);

export const platformsSchema = z.record(z.string(), z.unknown()).transform((value): Platforms => {
    const platforms = {} as Platforms;
    for (const platform of PLATFORMS) platforms[platform] = value[platform] === true;
    return platforms;
});

export const appInputSchema = z.object({
    appId: identifierSchema('appId').optional(),
    name: text('Name', LIMITS.appName),
    description: text('Description', LIMITS.appDescription),
    status: appStatusSchema,
    tag: appTagSchema,
    platforms: platformsSchema,
    thumbnail: imageDataUrlSchema(LIMITS.thumbnailBytes).optional(),
});

/* ─── Leaderboard API ───────────────────────────────────────────────────────── */

export const playerNameSchema = z
    .string({ error: 'The `name` argument is not provided.' })
    .transform(cleanText)
    .pipe(
        z
            .string()
            .min(
                1,
                `The \`name\` must be at least 1 character and no more than ${LIMITS.playerName} characters.`,
            )
            .max(
                LIMITS.playerName,
                `The \`name\` must be at least 1 character and no more than ${LIMITS.playerName} characters.`,
            ),
    );

export const scoreSchema = z
    .string({ error: 'The `score` argument is not provided.' })
    .trim()
    .regex(
        /^-?\d{1,16}$/,
        'The provided `score` argument must be an integer (positive and negative values are accepted).',
    )
    .transform(Number)
    .refine(
        Number.isSafeInteger,
        `The provided \`score\` argument must be within ${Number.MIN_SAFE_INTEGER} and ${Number.MAX_SAFE_INTEGER}.`,
    );

export function limitSchema(defaultValue: number, max: number) {
    return z
        .string()
        .trim()
        .regex(/^\d{1,4}$/, `The \`limit\` argument must be an integer between 1 and ${max}.`)
        .transform(Number)
        .refine(
            (value) => value >= 1 && value <= max,
            `The \`limit\` argument must be an integer between 1 and ${max}.`,
        )
        .optional()
        .transform((value) => value ?? defaultValue);
}

/** First human-readable message of a failed parse. */
export function firstIssue(error: z.ZodError): string {
    return error.issues[0]?.message ?? 'Invalid input.';
}

/** `{ field: message }` using the first issue per top-level field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
    const result: Record<string, string> = {};

    for (const issue of error.issues) {
        const field = String(issue.path[0] ?? 'form');
        result[field] ??= issue.message;
    }

    return result;
}

/** Parses input or throws a 400 `AppError` carrying the first validation message. */
export function parseInput<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) throw badRequest(firstIssue(result.error));
    return result.data;
}
