import { LIMITS } from './constants';

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

export function readFileAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Could not read that file.'));
        };
        reader.onerror = () => reject(new Error('Could not read that file.'));
        reader.readAsDataURL(file);
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress that image.'))),
            type,
            quality,
        );
    });
}

/**
 * Prepares an uploaded image for use as an app thumbnail: small images are kept byte-for-byte
 * (so pixel art stays crisp); large ones are scaled down and re-encoded as WebP to fit the limit.
 */
export async function prepareThumbnail(file: File): Promise<string> {
    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        throw new Error('Choose a PNG, JPEG, WebP or GIF image.');
    }
    if (file.size > MAX_SOURCE_BYTES) {
        throw new Error('That image is over 15 MB. Pick a smaller one.');
    }

    const bitmap = await createImageBitmap(file);

    try {
        const longestEdge = Math.max(bitmap.width, bitmap.height);

        if (longestEdge <= LIMITS.thumbnailEdge && file.size <= LIMITS.thumbnailBytes) {
            return await readFileAsDataUrl(file);
        }

        const scale = Math.min(1, LIMITS.thumbnailEdge / longestEdge);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Your browser could not process that image.');

        context.imageSmoothingQuality = 'high';
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        for (const quality of [0.9, 0.8, 0.65, 0.5]) {
            const blob = await canvasToBlob(canvas, 'image/webp', quality);
            if (blob.size <= LIMITS.thumbnailBytes) return await readFileAsDataUrl(blob);
        }

        throw new Error('That image is too detailed to compress under 512 KB.');
    } finally {
        bitmap.close();
    }
}

/**
 * Prepares a profile picture: centre-cropped to a square and scaled down to the stored size, so
 * uploads stay small. The server re-encodes it again anyway.
 */
export async function prepareAvatar(file: File): Promise<string> {
    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        throw new Error('Choose a PNG, JPEG, WebP or GIF image.');
    }
    if (file.size > MAX_SOURCE_BYTES) {
        throw new Error('That image is over 15 MB. Pick a smaller one.');
    }

    const bitmap = await createImageBitmap(file);

    try {
        const side = Math.min(bitmap.width, bitmap.height);
        const edge = Math.min(side, LIMITS.avatarEdge);
        const canvas = document.createElement('canvas');
        canvas.width = edge;
        canvas.height = edge;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Your browser could not process that image.');

        context.imageSmoothingQuality = 'high';
        context.drawImage(
            bitmap,
            (bitmap.width - side) / 2,
            (bitmap.height - side) / 2,
            side,
            side,
            0,
            0,
            edge,
            edge,
        );

        for (const quality of [0.92, 0.8, 0.6]) {
            const blob = await canvasToBlob(canvas, 'image/webp', quality);
            if (blob.size <= LIMITS.avatarBytes) return await readFileAsDataUrl(blob);
        }

        throw new Error('That image is too detailed to use as a profile picture.');
    } finally {
        bitmap.close();
    }
}
