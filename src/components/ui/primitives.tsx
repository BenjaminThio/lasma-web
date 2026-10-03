import type { ComponentProps, ReactNode } from 'react';
import { cn, hasUtility } from '@/lib/cn';

export function Container({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'mx-auto w-full px-4 sm:px-6',
                !hasUtility(className, /^max-w-/) && 'max-w-6xl',
                className,
            )}
            {...props}
        />
    );
}

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            aria-hidden
            className={cn('skeleton', !hasUtility(className, /^rounded(-|$)/) && 'rounded-md', className)}
            {...props}
        />
    );
}

/** "Loading..." style dots that type themselves out, like the original console loader. */
export function LoadingDots({ className }: { className?: string }) {
    return (
        <span aria-hidden className={cn('inline-block w-[3ch] text-left align-bottom', className)}>
            <span className="inline-block animate-dots overflow-hidden align-bottom whitespace-nowrap">
                ...
            </span>
        </span>
    );
}

interface SectionHeadingProps {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    align?: 'left' | 'center';
    className?: string;
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}
        >
            <p className="font-pixel-sm text-sm tracking-widest text-accent uppercase">{`// ${eyebrow}`}</p>
            <h2 className="max-w-3xl text-3xl leading-tight font-bold text-balance sm:text-4xl">{title}</h2>
            {description ? (
                <p className="max-w-2xl font-pixel-sm text-base leading-relaxed text-pretty text-muted sm:text-lg">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
    return (
        <kbd
            className={cn(
                'rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[0.85em]',
                className,
            )}
            {...props}
        />
    );
}
