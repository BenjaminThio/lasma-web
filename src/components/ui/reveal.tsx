import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Stagger delay in ms. */
    delay?: number;
    as?: 'div' | 'section' | 'li' | 'article';
}

/**
 * Pops content in as it scrolls into view. A server component: it only marks the element, and the
 * single `<RevealObserver>` in the root layout animates every marked element on every page. Content
 * is rendered visible, so nothing stays hidden without JavaScript.
 */
export function Reveal({ children, className, delay = 0, as: Component = 'div' }: RevealProps) {
    return (
        <Component
            data-reveal=""
            className={className}
            style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
        >
            {children}
        </Component>
    );
}
