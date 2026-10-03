'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition, type CSSProperties, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { faTrashCan } from '@/components/ui/icons';
import { ListFooter } from '@/components/ui/list-footer';
import { Skeleton } from '@/components/ui/primitives';
import { toast } from '@/components/ui/toast';
import { useInfiniteList } from '@/hooks/use-infinite-list';
import { fetchLeaderboardPage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { PAGE_SIZE } from '@/lib/constants';
import type { Page, Player } from '@/lib/domain';
import { formatNumber, formatPlayerDate, pluralize } from '@/lib/format';
import { removeLeaderboardEntryAction } from '@/server/actions/apps';

const RANK_COLORS = ['text-gold', 'text-silver', 'text-bronze'];

/*
 * Rounded corners follow the last *visible* column: SCORE on phones, DATE from `sm` up.
 */
const cell = 'bg-raised px-3 sm:px-4';
const lastRowLeft = '[tr:last-child>&]:rounded-bl-lg';
const scoreEdge = 'rounded-r-none [tr:last-child>&]:rounded-br-lg sm:[tr:last-child>&]:rounded-br-none';
const dateEdge = 'sm:[tr:last-child>&]:rounded-br-lg';

/** Owners see it on hover with a mouse, and all the time on touch screens. */
const removeButton =
    'ml-auto grid size-8 shrink-0 place-items-center rounded-md font-pixel text-base text-muted transition-[opacity,color,background-color] hover:bg-halt hover:text-white pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100';

interface PlayerRowProps {
    player: Player;
    index: number;
    onRemove?: (player: Player) => void;
}

function PlayerRow({ player, index, onRemove }: PlayerRowProps) {
    const { date, time, iso } = formatPlayerDate(player.datetime);

    return (
        <tr
            className="group h-16 animate-pop-in transition-[scale] duration-500 stagger hover:scale-[1.03] sm:h-20"
            style={{ '--i': index } as CSSProperties}
        >
            <td
                className={cn(
                    cell,
                    lastRowLeft,
                    'transition-colors duration-500 group-hover:rounded-l-lg group-hover:bg-highlight group-hover:text-canvas',
                    RANK_COLORS[player.rank - 1],
                )}
            >
                {player.rank}.
            </td>
            <td className={cn(cell, 'max-w-0')}>
                <div className="flex items-center gap-2">
                    <span className="truncate" title={player.name}>
                        {player.name}
                    </span>
                    {onRemove ? (
                        <button
                            type="button"
                            aria-label={`Remove ${player.name} from the leaderboard`}
                            title="Remove from leaderboard"
                            onClick={() => onRemove(player)}
                            className={removeButton}
                        >
                            <Icon icon={faTrashCan} />
                        </button>
                    ) : null}
                </div>
            </td>
            <td
                className={cn(
                    cell,
                    'hidden max-w-0 truncate font-mono text-sm text-muted select-text md:table-cell',
                )}
            >
                <span title={player.id}>#{player.id}</span>
            </td>
            <td
                className={cn(
                    cell,
                    scoreEdge,
                    'text-center tabular-nums group-hover:rounded-r-lg sm:group-hover:rounded-r-none',
                )}
            >
                {formatNumber(player.score)}
            </td>
            <td
                className={cn(
                    cell,
                    dateEdge,
                    'hidden text-center whitespace-nowrap sm:table-cell sm:group-hover:rounded-r-lg',
                )}
            >
                <time dateTime={iso} title={`${date}, ${time}`}>
                    {date}
                </time>
            </td>
        </tr>
    );
}

function SkeletonRows({ count }: { count: number }) {
    return Array.from({ length: count }, (_, index) => (
        <tr key={index} aria-hidden className="h-16 sm:h-20">
            <td className={cell}>
                <Skeleton className="h-4 w-6" />
            </td>
            <td className={cell}>
                <Skeleton className="h-4 w-3/4" />
            </td>
            <td className={cn(cell, 'hidden md:table-cell')}>
                <Skeleton className="h-4 w-2/3" />
            </td>
            <td className={cell}>
                <Skeleton className="mx-auto h-4 w-12" />
            </td>
            <td className={cn(cell, 'hidden sm:table-cell')}>
                <Skeleton className="mx-auto h-4 w-24" />
            </td>
        </tr>
    ));
}

export function LeaderboardTableShell({ children, empty }: { children: ReactNode; empty?: boolean }) {
    return (
        <table className="w-full table-auto border-separate border-spacing-y-[5px] text-lg sm:text-xl">
            <caption className="sr-only">Leaderboard, highest score first</caption>
            <thead>
                <tr className="h-16 sm:h-20">
                    <th
                        scope="col"
                        className={cn(
                            cell,
                            'w-[4.5rem] rounded-tl-lg text-left sm:w-[5.5rem]',
                            empty && 'rounded-bl-none',
                        )}
                    >
                        NO.
                    </th>
                    <th scope="col" className={cn(cell, 'text-left')}>
                        NAME
                    </th>
                    <th scope="col" className={cn(cell, 'hidden w-[22%] text-left md:table-cell')}>
                        ID
                    </th>
                    <th
                        scope="col"
                        className={cn(cell, 'w-28 rounded-tr-lg text-center sm:w-32 sm:rounded-tr-none')}
                    >
                        SCORE
                    </th>
                    <th
                        scope="col"
                        className={cn(cell, 'hidden w-44 text-center sm:table-cell sm:rounded-tr-lg')}
                    >
                        DATE
                    </th>
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    );
}

export function EmptyLeaderboard() {
    return (
        <div className="-mt-[5px] mb-8 grid min-h-[40svh] place-items-center rounded-b-lg bg-raised p-6 text-center text-xl sm:text-2xl">
            There is nothing here.
        </div>
    );
}

interface LeaderboardTableProps {
    appId: string;
    initialPage: Page<Player>;
    total: number;
    /** The app's owner can remove rows (cheaters, test scores). */
    canModerate?: boolean;
}

export function LeaderboardTable({ appId, initialPage, total, canModerate = false }: LeaderboardTableProps) {
    const router = useRouter();
    const fetchPage = useCallback(
        (cursor: string, signal: AbortSignal) =>
            fetchLeaderboardPage(appId, cursor, PAGE_SIZE.leaderboard, signal),
        [appId],
    );
    const { items, setItems, hasMore, status, loadMore, sentinelRef } = useInfiniteList({
        initialPage,
        fetchPage,
    });
    const [pendingRemoval, setPendingRemoval] = useState<Player | null>(null);
    const [removing, startRemoving] = useTransition();

    function confirmRemoval() {
        const player = pendingRemoval;
        if (!player) return;

        startRemoving(async () => {
            const result = await removeLeaderboardEntryAction(appId, player.id);

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            // Everyone below moves up one place.
            setItems((current) =>
                current
                    .filter((entry) => entry.id !== player.id)
                    .map((entry) => (entry.rank > player.rank ? { ...entry, rank: entry.rank - 1 } : entry)),
            );
            setPendingRemoval(null);
            toast.success(`Removed ${player.name}.`);
            // Updates the player count in the header; the loaded rows above are kept.
            router.refresh();
        });
    }

    const moderationDialog = canModerate ? (
        <Dialog
            open={pendingRemoval !== null}
            onClose={() => (removing ? undefined : setPendingRemoval(null))}
            title={`Remove ${pendingRemoval?.name ?? 'this player'}?`}
            description="Their score is deleted for good. If your game sends it again, they will come back as a new entry."
            className="font-pixel"
            footer={
                <>
                    <Button variant="ghost" onClick={() => setPendingRemoval(null)} disabled={removing}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmRemoval}
                        disabled={removing}
                        aria-busy={removing}
                    >
                        <Icon icon={faTrashCan} /> {removing ? 'Removing…' : 'Remove player'}
                    </Button>
                </>
            }
        />
    ) : null;

    if (items.length === 0) {
        return (
            <>
                <LeaderboardTableShell empty>{null}</LeaderboardTableShell>
                <EmptyLeaderboard />
                {moderationDialog}
            </>
        );
    }

    return (
        <>
            <LeaderboardTableShell>
                {items.map((player, index) => (
                    <PlayerRow
                        key={player.id}
                        player={player}
                        index={index % PAGE_SIZE.leaderboard}
                        onRemove={canModerate ? setPendingRemoval : undefined}
                    />
                ))}
                {status === 'loading' ? <SkeletonRows count={3} /> : null}
            </LeaderboardTableShell>
            <ListFooter
                hasMore={hasMore}
                status={status}
                onLoadMore={loadMore}
                sentinelRef={sentinelRef}
                loadMoreLabel={`Load ${PAGE_SIZE.leaderboard} more`}
                endLabel={`End of the board · ${pluralize(total, 'player')}`}
            />
            {moderationDialog}
        </>
    );
}

export { SkeletonRows as LeaderboardSkeletonRows };
