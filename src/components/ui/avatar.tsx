import Image from 'next/image';
import { galaxyImage } from '@/config/assets';
import { cn } from '@/lib/cn';

interface AvatarProps {
    /** An uploaded avatar URL, or `null` for the default galaxy. */
    src: string | null;
    /** Rendered size in CSS pixels, used to pick the right image width. */
    size: number;
    priority?: boolean;
    /** Adds the soft inner glow from the original navbar avatar. */
    glow?: boolean;
    className?: string;
}

export function Avatar({ src, size, priority = false, glow = true, className }: AvatarProps) {
    return (
        <span className={cn('relative block shrink-0 overflow-hidden rounded-full bg-canvas', className)}>
            {src ? (
                // Uploaded avatars are already 256px WebP with immutable URLs; no optimizer pass needed.
                <Image
                    src={src}
                    alt=""
                    fill
                    sizes={`${size}px`}
                    unoptimized
                    priority={priority}
                    className="object-cover"
                />
            ) : (
                <Image
                    src={galaxyImage}
                    alt=""
                    fill
                    sizes={`${size}px`}
                    priority={priority}
                    className="object-cover pixelated"
                />
            )}
            {glow ? <span aria-hidden className="absolute inset-0 rounded-full shadow-avatar" /> : null}
        </span>
    );
}
