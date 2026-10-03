import { ViewTransition, type ReactNode } from 'react';

/**
 * Soft cross-fade between pages during client-side navigation (View Transitions API).
 * Wraps each page rather than a layout, because layouts persist across navigations.
 * Browsers without support simply swap instantly.
 */
export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <ViewTransition enter="page" exit="page" default="none">
            {children}
        </ViewTransition>
    );
}
