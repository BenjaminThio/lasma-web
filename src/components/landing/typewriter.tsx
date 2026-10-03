import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface TypewriterProps {
    text: string;
    className?: string;
}

/**
 * The original typed-out headline with a blinking cursor, done entirely in CSS (see `.typewriter`
 * in globals.css): each character waits its turn and carries the cursor while it is the newest.
 * No JavaScript, so it starts typing on first paint; every character is laid out from the start,
 * so the heading never shifts; screen readers and search engines get the plain sentence.
 */
export function Typewriter({ text, className }: TypewriterProps) {
    return (
        <h1 aria-label={text} className={cn('typewriter font-bold text-balance', className)}>
            {Array.from(text, (character, index) => (
                <span key={index} aria-hidden style={{ '--i': index } as CSSProperties}>
                    {character}
                </span>
            ))}
        </h1>
    );
}
