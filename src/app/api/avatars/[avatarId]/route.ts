import { db } from '@/server/db';
import { notFound } from '@/server/errors';
import { route } from '@/server/http/api';
import { decodeImage } from '@/server/services/images';

const AVATAR_ID = /^[A-Za-z0-9_-]{24}$/;

/** Avatars get a fresh random id on every upload, so each URL's content never changes. */
export const GET = route(async (_request, { params }: RouteContext<'/api/avatars/[avatarId]'>) => {
    const { avatarId } = await params;
    if (!AVATAR_ID.test(avatarId)) throw notFound('Avatar not found.');

    const avatar = await db().avatars.find(avatarId);
    const image = avatar ? decodeImage(avatar.dataUrl) : null;
    if (!image) throw notFound('Avatar not found.');

    return new Response(new Uint8Array(image.bytes), {
        headers: {
            'Content-Type': image.mime,
            'Content-Length': String(image.bytes.length),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'none'; sandbox",
            'Cross-Origin-Resource-Policy': 'same-origin',
        },
    });
});
