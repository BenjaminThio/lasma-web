'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn, hasUtility } from '@/lib/cn';

interface SmartImageProps extends ImageProps {
    /** Classes for the wrapper, which carries the shimmer while the image loads. */
    wrapperClassName?: string;
}

/**
 * `next/image` (lazy by default) with a shimmer placeholder that fades into the decoded image,
 * so slow connections see a calm skeleton instead of an image painting in line by line.
 */
export function SmartImage({ className, wrapperClassName, alt, onLoad, onError, ...props }: SmartImageProps) {
    // Priority images are above the fold (usually the LCP element): paint them the moment they
    // decode instead of waiting for hydration to fade them in.
    const [loaded, setLoaded] = useState(props.priority === true);

    return (
        <span
            data-smart-image
            className={cn(
                'block overflow-hidden',
                !hasUtility(wrapperClassName, /^(absolute|fixed|sticky)$/) && 'relative',
                !loaded && 'skeleton',
                wrapperClassName,
            )}
        >
            <Image
                alt={alt}
                className={cn(
                    'transition-opacity duration-500 ease-out',
                    loaded ? 'opacity-100' : 'opacity-0',
                    className,
                )}
                onLoad={(event) => {
                    setLoaded(true);
                    onLoad?.(event);
                }}
                onError={(event) => {
                    setLoaded(true);
                    onError?.(event);
                }}
                {...props}
            />
        </span>
    );
}
