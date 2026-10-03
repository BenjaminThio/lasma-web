import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '@/server/db';
import { notFound } from '@/server/errors';
import { route } from '@/server/http/api';
import { decodeImage, type DecodedImage } from '@/server/services/images';
import { identifierSchema, parseInput } from '@/server/validation';

const appIdSchema = identifierSchema('appId');

let placeholder: Promise<DecodedImage> | undefined;

/** The default galaxy image, read once and served inline (no redirect round-trip). */
function loadPlaceholder(): Promise<DecodedImage> {
    placeholder ??= readFile(path.join(process.cwd(), 'public', 'images', 'galaxy.webp')).then((bytes) => ({
        mime: 'image/webp' as const,
        bytes,
    }));
    return placeholder;
}

/**
 * Serves an app thumbnail as a real, cacheable image instead of shipping base64 inside every
 * listing. URLs carry `?v=<thumbnailVersion>`, so a long cache lifetime is safe.
 */
export const GET = route(async (request, { params }: RouteContext<'/api/apps/[appId]/thumbnail'>) => {
    const appId = parseInput(appIdSchema, (await params).appId);
    const stored = await db().apps.findThumbnail(appId);

    if (!stored) throw notFound('App not found.');

    const uploaded = stored.dataUrl ? decodeImage(stored.dataUrl) : null;
    const image = uploaded ?? (await loadPlaceholder());

    const etag = `"${uploaded ? 'u' : 'p'}${stored.version.toString(36)}-${image.bytes.length.toString(36)}"`;
    // A URL carrying the current version never changes content: the version moves on every upload.
    const versioned = request.nextUrl.searchParams.get('v') === String(stored.version);
    const headers = {
        'Cache-Control': versioned
            ? 'public, max-age=31536000, immutable'
            : 'public, max-age=300, stale-while-revalidate=86400',
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Cross-Origin-Resource-Policy': 'same-origin',
    };

    if (request.headers.get('if-none-match') === etag) {
        return new Response(null, { status: 304, headers });
    }

    return new Response(new Uint8Array(image.bytes), {
        headers: { ...headers, 'Content-Type': image.mime, 'Content-Length': String(image.bytes.length) },
    });
});
