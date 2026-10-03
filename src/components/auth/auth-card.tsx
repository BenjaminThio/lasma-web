'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { faXmark } from '@/components/ui/icons';
import { TILT_TRANSFORM_CLASSES, useTilt } from '@/hooks/use-tilt';
import { cn } from '@/lib/cn';

interface AuthCardProps {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
}

/**
 * The login/sign-up card: the original layout (corner close button, big title, underlined fields)
 * in the app's dark theme, with the gentle mouse tilt and a warm glare where the red one used to be.
 */
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
    const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(3);

    return (
        <div className="w-full max-w-[26rem] animate-pop-in">
            <div
                ref={ref}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                className={cn(
                    'relative overflow-hidden rounded-2xl border-3 border-canvas bg-surface shadow-float transition-transform duration-300 ease-out',
                    TILT_TRANSFORM_CLASSES,
                )}
            >
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,0%),rgb(255_210_0/0.09),transparent_55%)] opacity-[var(--glare,0)] transition-opacity duration-300 motion-reduce:hidden"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent"
                />

                <Link
                    href="/"
                    aria-label="Close and return home"
                    className="absolute -top-6 -right-6 z-10 size-20 rounded-[2rem] bg-raised text-white transition-[scale,background-color,color] duration-500 hover:scale-120 hover:bg-accent hover:text-canvas"
                >
                    <Icon icon={faXmark} className="absolute bottom-4 left-[1.2rem] text-3xl" />
                </Link>

                <div className="relative flex min-h-[30rem] flex-col items-center justify-center px-6 py-12 sm:px-10">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {subtitle ? (
                        <p className="mt-2 text-center font-pixel-sm text-sm text-balance text-muted">
                            {subtitle}
                        </p>
                    ) : null}
                    <div className="mt-9 w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}
