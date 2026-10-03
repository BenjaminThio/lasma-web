'use client';

import Image from 'next/image';
import { useState, type ChangeEvent } from 'react';
import { Icon } from '@/components/ui/icon';
import { faClipboard, faImage, faUpload } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/primitives';
import { toast } from '@/components/ui/toast';
import { formatBytes } from '@/lib/format';
import { readFileAsDataUrl } from '@/lib/image-client';

const buttonClasses =
    'inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 text-lg text-black transition-[scale] duration-500 hover:scale-110 disabled:pointer-events-none disabled:opacity-50';

interface Result {
    dataUrl: string;
    name: string;
    size: number;
}

export function ImageToBase64() {
    const [result, setResult] = useState<Result | null>(null);
    const [reading, setReading] = useState(false);

    async function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Choose an image file.');
            return;
        }

        setReading(true);
        try {
            setResult({ dataUrl: await readFileAsDataUrl(file), name: file.name, size: file.size });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not read that file.');
        } finally {
            setReading(false);
        }
    }

    async function copy() {
        if (!result) return;

        try {
            await navigator.clipboard.writeText(result.dataUrl);
            toast.success(`Copied ${formatBytes(result.dataUrl.length)} of Base64.`);
        } catch {
            toast.error('Your browser blocked clipboard access.');
        }
    }

    return (
        <div className="flex w-full flex-col items-center gap-8">
            <div className="relative grid aspect-[4/3] w-full max-w-xl animate-pop-in place-items-center overflow-hidden rounded-[5%] bg-surface">
                {reading ? (
                    <Skeleton className="absolute inset-0 rounded-none" />
                ) : result ? (
                    <Image
                        src={result.dataUrl}
                        alt={result.name}
                        fill
                        unoptimized
                        className="object-contain"
                        draggable={false}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 text-muted">
                        <Icon icon={faImage} className="text-5xl" />
                        <p className="font-pixel-sm">Your image shows up here</p>
                    </div>
                )}
            </div>

            {result ? (
                <p className="max-w-xl text-center font-pixel-sm text-sm text-muted">
                    {result.name} · {formatBytes(result.size)} → {formatBytes(result.dataUrl.length)} as
                    Base64
                </p>
            ) : null}

            <div className="flex flex-wrap justify-center gap-4">
                <label className={buttonClasses}>
                    <Icon icon={faUpload} /> CHOOSE FILE
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
                </label>
                <button type="button" className={buttonClasses} onClick={copy} disabled={!result}>
                    <Icon icon={faClipboard} /> COPY BASE64
                </button>
            </div>

            <p className="max-w-md text-center font-pixel-sm text-xs text-subtle">
                Everything happens in your browser. The image is never uploaded.
            </p>
        </div>
    );
}
