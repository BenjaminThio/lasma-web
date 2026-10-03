import 'server-only';
import { z } from 'zod';
import { badRequest } from '@/server/errors';

/*
 * Opaque pagination cursors. Clients pass them back verbatim; they are validated on the way in
 * like any other input.
 */

export const playerCursorSchema = z.object({
    /** score of the last row */
    s: z.number().refine(Number.isSafeInteger),
    /** id of the last row */
    i: z.string().min(1).max(64),
    /** rows already returned (used to number the next page) */
    n: z.number().int().nonnegative().max(1_000_000_000),
});

export const appCursorSchema = z.object({
    i: z.string().min(1).max(64),
});

export function encodeCursor(value: object): string {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

export function decodeCursor<T>(raw: string | null | undefined, schema: z.ZodType<T>): T | null {
    if (!raw) return null;

    try {
        if (raw.length > 512) throw new Error('too long');
        return schema.parse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
    } catch {
        throw badRequest('The `cursor` argument is invalid.');
    }
}
