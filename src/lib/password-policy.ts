import { LIMITS } from './constants';

/*
 * Password rules shared by the sign-up form (live hints and the strength meter) and the server
 * (enforcement). The estimate is deliberately simple and dependency-free: it rewards length and
 * variety, and discounts the patterns people actually use (repeats, runs, keyboard rows, common
 * passwords, and their own name or email).
 */

/** Frequently breached passwords, compared case-insensitively and with trailing digits/symbols removed. */
const COMMON_PASSWORDS = new Set([
    'password',
    'passw0rd',
    'p@ssw0rd',
    'p@ssword',
    'letmein',
    'welcome',
    'iloveyou',
    'sunshine',
    'princess',
    'football',
    'baseball',
    'superman',
    'batman',
    'starwars',
    'trustno1',
    'dragon',
    'monkey',
    'master',
    'shadow',
    'michael',
    'jennifer',
    'charlie',
    'whatever',
    'computer',
    'freedom',
    'secret',
    'changeme',
    'default',
    'admin',
    'administrator',
    'qwerty',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
    'qazwsx',
    '1q2w3e4r',
    '1qaz2wsx',
    'zaq12wsx',
    'abc',
    'abcdef',
    'abcdefg',
    'abcdefgh',
    'pokemon',
    'minecraft',
    'fortnite',
    'roblox',
    'mustang',
    'liverpool',
    'chelsea',
    'arsenal',
    'samsung',
    'internet',
    'hello',
    'killer',
    'lasma',
    'lasmastudio',
    'leaderboard',
]);

const KEYBOARD_ROWS = ['qwertyuiopasdfghjklzxcvbnm', '1234567890', 'abcdefghijklmnopqrstuvwxyz'];

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export const PASSWORD_SCORE_LABELS: Record<PasswordScore, string> = {
    0: 'Very weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Strong',
    4: 'Very strong',
};

export interface PasswordRequirement {
    id: 'length' | 'common' | 'personal';
    label: string;
    met: boolean;
}

export interface PasswordAssessment {
    score: PasswordScore;
    label: string;
    requirements: PasswordRequirement[];
    /** Every hard requirement is met (the server would accept it). */
    acceptable: boolean;
    /** A nudge towards a stronger password, when there is one worth giving. */
    suggestion: string | null;
}

export function isCommonPassword(password: string): boolean {
    const lower = password.toLowerCase();
    if (COMMON_PASSWORDS.has(lower)) return true;

    const stem = lower.replace(/[^a-z]+$/, '').replace(/^[^a-z]+/, '');
    if (stem.length > 0 && COMMON_PASSWORDS.has(stem)) return true;

    // Nothing but a run of one character or a keyboard/alphabet run, e.g. "aaaaaaaa", "12345678".
    if (/^(.)\1*$/.test(lower)) return true;
    return KEYBOARD_ROWS.some((row) => row.includes(lower));
}

/** The parts of a name or email worth checking for (the local part of an email, 4+ characters). */
function personalTokens(values: readonly string[]): string[] {
    const tokens = new Set<string>();

    for (const value of values) {
        const lower = value.trim().toLowerCase();
        if (!lower) continue;

        const local = lower.split('@')[0] ?? lower;
        for (const token of [lower, local, local.replace(/[^a-z0-9]/g, '')]) {
            if (token.length >= 4) tokens.add(token);
        }
    }

    return [...tokens];
}

export function containsPersonalInfo(password: string, personal: readonly string[]): boolean {
    const lower = password.toLowerCase();
    return personalTokens(personal).some((token) => lower.includes(token));
}

/** Characters that just repeat or continue the previous one ("aaaa", "abcd", "4321") count for little. */
function effectiveLength(password: string): number {
    let total = 0;
    let previous: number | null = null;

    for (const character of password.toLowerCase()) {
        const code = character.codePointAt(0) ?? 0;
        const predictable = previous !== null && Math.abs(code - previous) <= 1;
        total += predictable ? 0.25 : 1;
        previous = code;
    }

    return total;
}

function poolSize(password: string): number {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 33;
    return Math.max(pool, 10);
}

export function assessPassword(password: string, personal: readonly string[] = []): PasswordAssessment {
    // Code points, not UTF-16 units, so an emoji counts as one character.
    const length = Array.from(password).length;
    const common = password.length > 0 && isCommonPassword(password);
    const personalMatch = password.length > 0 && containsPersonalInfo(password, personal);

    const requirements: PasswordRequirement[] = [
        {
            id: 'length',
            label: `${LIMITS.passwordMin} to ${LIMITS.passwordMax} characters`,
            met: length >= LIMITS.passwordMin && length <= LIMITS.passwordMax,
        },
        { id: 'common', label: 'Not a common or easily guessed password', met: length > 0 && !common },
        {
            id: 'personal',
            label: "Doesn't include your username or email",
            met: length > 0 && !personalMatch,
        },
    ];
    const acceptable = requirements.every((requirement) => requirement.met);

    let bits = effectiveLength(password) * Math.log2(poolSize(password));
    if (personalMatch) bits *= 0.5;

    let score: PasswordScore = bits < 28 ? 0 : bits < 40 ? 1 : bits < 56 ? 2 : bits < 72 ? 3 : 4;
    if (common) score = 0;
    else if (!acceptable) score = Math.min(score, 1) as PasswordScore;

    let suggestion: string | null = null;
    if (length > 0 && score < 3) {
        if (common) suggestion = 'Avoid common words and keyboard patterns.';
        else if (personalMatch) suggestion = 'Leave out your name and email.';
        else if (length < 12) suggestion = 'Longer is stronger: try 12 or more characters.';
        else if (poolSize(password) < 62) suggestion = 'Mix in capitals, numbers or symbols.';
        else suggestion = 'Avoid repeated characters and sequences like "abcd" or "1234".';
    }

    return { score, label: PASSWORD_SCORE_LABELS[score], requirements, acceptable, suggestion };
}
