import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** URL-safe random token with `bytes` of entropy. */
export function randomToken(bytes = 32): string {
    return randomBytes(bytes).toString('base64url');
}

export function sha256(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Constant-time string comparison (hashing first makes lengths equal). */
export function safeEqual(a: string, b: string): boolean {
    const left = createHash('sha256').update(a, 'utf8').digest();
    const right = createHash('sha256').update(b, 'utf8').digest();
    return timingSafeEqual(left, right);
}
