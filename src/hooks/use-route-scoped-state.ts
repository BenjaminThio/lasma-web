'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * State that automatically resets when the route changes — no effect needed. The value is stored
 * together with the pathname it was set on, and reads as `null` on any other page.
 *
 * Used for "which menu is open", so every navbar panel closes the moment you navigate.
 */
export function useRouteScopedState<T>(): [T | null, (value: T | null) => void] {
    const pathname = usePathname();
    const [entry, setEntry] = useState<{ value: T; pathname: string } | null>(null);

    const value = entry && entry.pathname === pathname ? entry.value : null;
    const setValue = (next: T | null) => setEntry(next === null ? null : { value: next, pathname });

    return [value, setValue];
}
