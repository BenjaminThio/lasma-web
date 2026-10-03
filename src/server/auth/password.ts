import 'server-only';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/*
 * scrypt with OWASP's recommended cost (N=2^15, r=8, p=3 ≈ 32 MiB). Parameters are stored with
 * every hash, so they can be raised later and old hashes upgraded transparently on login.
 * Format: scrypt$N$r$p$salt$hash (base64url).
 */
const CURRENT = { N: 2 ** 15, r: 8, p: 3, keyLength: 64, saltLength: 16 } as const;
const MAX_MEMORY = 256 * 1024 * 1024;

interface ScryptParams {
    N: number;
    r: number;
    p: number;
}

function derive(password: string, salt: Buffer, params: ScryptParams, keyLength: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(
            password.normalize('NFC'),
            salt,
            keyLength,
            { ...params, maxmem: MAX_MEMORY },
            (error, key) => {
                if (error) reject(error);
                else resolve(key);
            },
        );
    });
}

function parse(stored: string): (ScryptParams & { salt: Buffer; key: Buffer }) | null {
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return null;

    const [, n, r, p, salt, key] = parts;
    const params = { N: Number(n), r: Number(r), p: Number(p) };

    const sane =
        Number.isInteger(params.N) &&
        params.N >= 2 ** 10 &&
        params.N <= 2 ** 20 &&
        (params.N & (params.N - 1)) === 0 &&
        Number.isInteger(params.r) &&
        params.r >= 1 &&
        params.r <= 32 &&
        Number.isInteger(params.p) &&
        params.p >= 1 &&
        params.p <= 16;

    if (!sane || !salt || !key) return null;

    return { ...params, salt: Buffer.from(salt, 'base64url'), key: Buffer.from(key, 'base64url') };
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(CURRENT.saltLength);
    const key = await derive(password, salt, CURRENT, CURRENT.keyLength);

    return [
        'scrypt',
        CURRENT.N,
        CURRENT.r,
        CURRENT.p,
        salt.toString('base64url'),
        key.toString('base64url'),
    ].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const parsed = parse(stored);
    if (!parsed || parsed.key.length === 0) return false;

    const candidate = await derive(password, parsed.salt, parsed, parsed.key.length);
    return timingSafeEqual(candidate, parsed.key);
}

export function needsRehash(stored: string): boolean {
    const parsed = parse(stored);
    return !parsed || parsed.N !== CURRENT.N || parsed.r !== CURRENT.r || parsed.p !== CURRENT.p;
}

/** Spend the same time as a real check so response timing doesn't reveal which emails exist. */
export async function simulatePasswordCheck(password: string): Promise<void> {
    await derive(password, randomBytes(CURRENT.saltLength), CURRENT, CURRENT.keyLength);
}
