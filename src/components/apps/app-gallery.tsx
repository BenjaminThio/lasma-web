'use client';

import type { Route } from 'next';
import { useCallback } from 'react';
import { ListFooter } from '@/components/ui/list-footer';
import { useInfiniteList } from '@/hooks/use-infinite-list';
import { fetchAppsPage } from '@/lib/api-client';
import { PAGE_SIZE } from '@/lib/constants';
import type { AppSummary, Page } from '@/lib/domain';
import { pluralize } from '@/lib/format';
import { APP_GRID_CLASSES, AppCard, AppCardSkeleton } from './app-card';

export function AppGallery({ initialPage }: { initialPage: Page<AppSummary> }) {
    const fetchPage = useCallback(
        (cursor: string, signal: AbortSignal) => fetchAppsPage('public', cursor, PAGE_SIZE.gallery, signal),
        [],
    );
    const { items, hasMore, status, loadMore, sentinelRef } = useInfiniteList({ initialPage, fetchPage });

    if (items.length === 0) {
        return (
            <div className="grid min-h-80 place-items-center rounded-2xl bg-surface p-8 text-center text-xl">
                There is nothing here.
            </div>
        );
    }

    return (
        <>
            <ul className={APP_GRID_CLASSES}>
                {items.map((app, index) => (
                    <li key={app.id} className="flex w-full justify-center">
                        <AppCard
                            app={app}
                            href={`/app/${app.id}` as Route}
                            index={index % PAGE_SIZE.gallery}
                            priority={index < 4}
                        />
                    </li>
                ))}
                {status === 'loading'
                    ? Array.from({ length: 4 }, (_, index) => (
                          <li key={`skeleton-${index}`} className="flex w-full justify-center">
                              <AppCardSkeleton />
                          </li>
                      ))
                    : null}
            </ul>
            <ListFooter
                hasMore={hasMore}
                status={status}
                onLoadMore={loadMore}
                sentinelRef={sentinelRef}
                endLabel={`That's all ${pluralize(items.length, 'app')}.`}
            />
        </>
    );
}
