import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ShowcaseHeaderProps {
    title: string;
    children: ReactNode;
    className?: string;
}

/** Small title block shared by the component playground pages. */
export function ShowcaseHeader({ title, children, className }: ShowcaseHeaderProps) {
    return (
        <header className={cn('flex animate-fade-up flex-col items-center gap-2 text-center', className)}>
            <p className="font-pixel-sm text-sm tracking-widest text-accent uppercase">{'// components'}</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="max-w-xl font-pixel-sm text-muted">{children}</p>
        </header>
    );
}
