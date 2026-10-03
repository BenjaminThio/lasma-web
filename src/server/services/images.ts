import 'server-only';
import type sharp from 'sharp';
import { LIMITS } from '@/lib/constants';
import { badRequest, payloadTooLarge } from '@/server/errors';
import { logger } from '@/server/logger';

export type ImageMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';

const DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;
/** Refuse decompression bombs: nothing we store needs more than this many pixels. */
const MAX_INPUT_PIXELS = 4096 * 4096;

function matchesSignature(mime: ImageMime, bytes: Buffer): boolean {
    const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);

    switch (mime) {
        case 'image/png':
            return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
        case 'image/jpeg':
            return startsWith(0xff, 0xd8, 0xff);
        case 'image/gif':
            return startsWith(0x47, 0x49, 0x46, 0x38);
        case 'image/webp':
            return (
                bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
                bytes.subarray(8, 12).toString('ascii') === 'WEBP'
            );
    }
}

export interface DecodedImage {
    mime: ImageMime;
    bytes: Buffer;
}

/**
 * Decodes a stored image. Returns `null` for anything that isn't a real PNG/JPEG/WebP/GIF, which
 * also keeps SVG (scriptable) and legacy junk from ever being served.
 */
export function decodeImage(dataUrl: string): DecodedImage | null {
    const match = DATA_URL.exec(dataUrl);
    if (!match?.[1] || !match[2]) return null;

    const mime = match[1] as ImageMime;
    const bytes = Buffer.from(match[2], 'base64');

    return matchesSignature(mime, bytes) ? { mime, bytes } : null;
}

const toDataUrl = (mime: string, bytes: Buffer) => `data:${mime};base64,${bytes.toString('base64')}`;

interface ImageTarget {
    /** Longest edge (`inside`) or both edges (`cover`) of the stored image. */
    edge: number;
    fit: 'inside' | 'cover';
    maxUploadBytes: number;
}

const TARGETS = {
    thumbnail: { edge: LIMITS.thumbnailEdge, fit: 'inside', maxUploadBytes: LIMITS.thumbnailBytes },
    avatar: { edge: LIMITS.avatarEdge, fit: 'cover', maxUploadBytes: LIMITS.avatarBytes },
} as const satisfies Record<string, ImageTarget>;

type SharpModule = typeof sharp;
let sharpModule: Promise<SharpModule | null> | undefined;

/** sharp is optional at runtime: without it, validated uploads are stored as they came. */
function loadSharp(): Promise<SharpModule | null> {
    sharpModule ??= import('sharp')
        .then((module) => module.default)
        .catch((error: unknown) => {
            logger.warn('sharp is unavailable; storing images without re-encoding', { error });
            return null;
        });
    return sharpModule;
}

/**
 * Re-encodes an upload as WebP: resized for where it's shown, EXIF-rotated, and stripped of
 * metadata (camera GPS included) and anything smuggled after the image data. Small, flat-colour
 * images (pixel art) are kept lossless when that is smaller, so they stay crisp.
 */
async function reencode(image: DecodedImage, target: ImageTarget): Promise<string | null> {
    const sharp = await loadSharp();
    if (!sharp) return null;

    const source = sharp(image.bytes, {
        animated: image.mime === 'image/gif' || image.mime === 'image/webp',
        limitInputPixels: MAX_INPUT_PIXELS,
    });
    const { pages = 1 } = await source.metadata();

    const resized = source
        .rotate()
        .resize(target.edge, target.edge, { fit: target.fit, withoutEnlargement: true });

    if (pages > 1) {
        return toDataUrl('image/webp', await resized.webp({ quality: 80, effort: 4 }).toBuffer());
    }

    const [lossy, lossless] = await Promise.all([
        resized.clone().webp({ quality: 86, effort: 4, smartSubsample: true }).toBuffer(),
        image.mime === 'image/png' || image.mime === 'image/gif'
            ? resized.clone().webp({ lossless: true, effort: 4 }).toBuffer()
            : Promise.resolve(null),
    ]);

    // Lossless wins when it's small anyway (pixel art) or barely bigger than lossy: edges stay sharp.
    const best =
        lossless && (lossless.length <= 48 * 1024 || lossless.length <= lossy.length * 1.1)
            ? lossless
            : lossy;
    return toDataUrl('image/webp', best);
}

/** Validates an uploaded image and returns the data URL to store. */
export async function processImageUpload(dataUrl: string, kind: keyof typeof TARGETS): Promise<string> {
    const target = TARGETS[kind];
    const decoded = decodeImage(dataUrl);

    if (!decoded) throw badRequest('Upload a PNG, JPEG, WebP or GIF image.');
    if (decoded.bytes.length > target.maxUploadBytes) {
        throw payloadTooLarge(`Images must be ${target.maxUploadBytes / 1024} KB or smaller.`);
    }

    try {
        const reencoded = await reencode(decoded, target);
        if (reencoded) return reencoded;
    } catch (error) {
        logger.warn('Could not re-encode an uploaded image', { error, kind });
        throw badRequest("That image couldn't be read. Try saving it as a PNG or JPEG first.");
    }

    return toDataUrl(decoded.mime, decoded.bytes);
}
