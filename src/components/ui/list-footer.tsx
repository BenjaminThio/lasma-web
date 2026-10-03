'use client';

import type { Ref } from 'react';
import type { ListStatus } from '@/hooks/use-infinite-list';
import { cn } from '@/lib/cn';
import { Button } from './button';
import { LoadingDots } from './primitives';

interface ListFooterProps {
    hasMore: boolean;
    status: ListStatus;
    onLoadMore: () => void;
    /** Attach to trigger loading automatically as the user scrolls near the end. */
    sentinelRef?: Ref<HTMLDivElement>;
    loadMoreLabel?: string;
    endLabel?: string;
    className?: string;
}

/** End-of-list state for chunked lists: auto-load sentinel, manual button, retry and "the end". */
export function ListFooter({
    hasMore,
    status,
    onLoadMore,
    sentinelRef,
    loadMoreLabel = 'Load more',
    endLabel,
    className,
}: ListFooterProps) {
    return (
        <div
            className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-3 py-6 text-center',
                className,
            )}
        >
            {hasMore && sentinelRef ? <div ref={sentinelRef} aria-hidden className="h-px w-full" /> : null}

            {status === 'loading' ? (
                <p role="status" className="text-muted">
                    Loading
                    <LoadingDots />
                </p>
            ) : status === 'error' ? (
                <div role="alert" className="flex flex-col items-center gap-3">
                    <p className="font-pixel-sm text-muted">
                        Couldn&apos;t load more. Check your connection.
                    </p>
                    <Button variant="secondary" size="sm" onClick={onLoadMore}>
                        Try again
                    </Button>
                </div>
            ) : hasMore ? (
                <Button variant="secondary" size="sm" onClick={onLoadMore}>
                    {loadMoreLabel}
                </Button>
            ) : endLabel ? (
                <p className="font-pixel-sm text-sm text-subtle">{endLabel}</p>
            ) : null}
        </div>
    );
}
