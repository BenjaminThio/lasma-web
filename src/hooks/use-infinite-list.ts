'use client';

import { useCallback, useRef, useState } from 'react';
import type { Page } from '@/lib/domain';

export type ListStatus = 'idle' | 'loading' | 'error';

interface Options<T> {
    initialPage: Page<T>;
    fetchPage: (cursor: string, signal: AbortSignal) => Promise<Page<T>>;
    /** How far below the viewport to start loading the next chunk. */
    rootMargin?: string;
    /** Load the next chunk automatically when the sentinel scrolls into view (default `true`). */
    autoLoad?: boolean;
}

/**
 * Chunked loading for long lists: renders the server-provided first page, then fetches the next
 * page when a sentinel element nears the viewport. Only one request is in flight at a time.
 */
export function useInfiniteList<T>({
    initialPage,
    fetchPage,
    rootMargin = '800px 0px',
    autoLoad = true,
}: Options<T>) {
    const [items, setItems] = useState<T[]>(initialPage.items);
    const [cursor, setCursor] = useState<string | null>(initialPage.nextCursor);
    const [status, setStatus] = useState<ListStatus>('idle');
    const controllerRef = useRef<AbortController | null>(null);

    const loadMore = useCallback(async () => {
        if (!cursor || controllerRef.current) return;

        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus('loading');

        try {
            const page = await fetchPage(cursor, controller.signal);
            setItems((previous) => [...previous, ...page.items]);
            setCursor(page.nextCursor);
            setStatus('idle');
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error(error);
                setStatus('error');
            }
        } finally {
            if (controllerRef.current === controller) controllerRef.current = null;
        }
    }, [cursor, fetchPage]);

    /** Replace the whole list (e.g. after changing the page size). */
    const reset = useCallback((page: Page<T>) => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setItems(page.items);
        setCursor(page.nextCursor);
        setStatus('idle');
    }, []);

    const canAutoLoad = autoLoad && cursor !== null && status === 'idle';

    // Re-created whenever the list grows, so a sentinel that is still visible triggers again.
    const sentinelRef = useCallback(
        (node: HTMLElement | null) => {
            if (!node || !canAutoLoad) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) void loadMore();
                },
                { rootMargin },
            );
            observer.observe(node);

            return () => observer.disconnect();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `items.length` re-arms the observer
        [canAutoLoad, loadMore, rootMargin, items.length],
    );

    return { items, setItems, hasMore: cursor !== null, status, loadMore, reset, sentinelRef };
}
