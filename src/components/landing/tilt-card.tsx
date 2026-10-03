'use client';

import type { ReactNode } from 'react';
import { TILT_TRANSFORM_CLASSES, useTilt } from '@/hooks/use-tilt';
import { cn } from '@/lib/cn';

/** A barely-there tilt on mouse devices only (touch scrolling and reduced motion are left alone). */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
    const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(2);

    return (
        <div
            ref={ref}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={cn('transition-transform duration-700 ease-out', TILT_TRANSFORM_CLASSES, className)}
        >
            {children}
        </div>
    );
}
