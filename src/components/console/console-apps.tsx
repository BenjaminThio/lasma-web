'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useCallback, useState, useTransition, type CSSProperties } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Dialog } from '@/components/ui/dialog';
import { Dropdown } from '@/components/ui/dropdown';
import { Icon } from '@/components/ui/icon';
import { faEye, faPencil, faPlus, faTable, faTrashCan } from '@/components/ui/icons';
import { ListFooter } from '@/components/ui/list-footer';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { useInfiniteList } from '@/hooks/use-infinite-list';
import { fetchAppsPage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { CONSOLE_PAGE_SIZES, PAGE_SIZE } from '@/lib/constants';
import type { AppSummary, Page } from '@/lib/domain';
import { deleteAppAction, setAppVisibilityAction } from '@/server/actions/apps';

/** Desktop column template: NO. | TITLE | APP ID | PUBLIC | VIEW | EDIT | DELETE */
const COLUMNS = 'md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.5fr)_6.5rem_4.5rem_4.5rem_5.5rem]';

interface RowProps {
    app: AppSummary;
    number: number;
    index: number;
    onVisibilityChange: (app: AppSummary, isGlobal: boolean) => void;
    onDelete: (app: AppSummary) => void;
}

function AppRow({ app, number, index, onVisibilityChange, onDelete }: RowProps) {
    const viewHref = `/app/${app.id}` as Route;
    const editHref = `/app/${app.id}/edit` as Route;
    const iconCell =
        'flex items-center justify-center transition-colors duration-500 [&>svg]:transition-transform [&>svg]:duration-500 hover:[&>svg]:scale-150';

    return (
        <li className="animate-pop-in stagger" style={{ '--i': index } as CSSProperties}>
            {/* Phones and small tablets: a card */}
            <div className="flex flex-col gap-3 rounded-xl bg-raised p-4 md:hidden">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm text-subtle">{number}.</p>
                        <p className="truncate text-xl">{app.info.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">{app.isGlobal ? 'Public' : 'Private'}</span>
                        <Switch
                            size="sm"
                            label={`Public: ${app.info.name}`}
                            checked={app.isGlobal}
                            onCheckedChange={(checked) => onVisibilityChange(app, checked)}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-canvas/60 py-1 pr-1 pl-3">
                    <code className="truncate font-mono text-xs text-muted">{app.id}</code>
                    <CopyButton value={app.id} label={`Copy app ID for ${app.info.name}`} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-base">
                    <Link
                        href={viewHref}
                        className="flex items-center justify-center gap-2 rounded-lg bg-canvas/60 py-2 hover:bg-[lime] hover:text-canvas"
                    >
                        <Icon icon={faEye} /> View
                    </Link>
                    <Link
                        href={editHref}
                        className="flex items-center justify-center gap-2 rounded-lg bg-canvas/60 py-2 hover:bg-[yellow] hover:text-canvas"
                    >
                        <Icon icon={faPencil} /> Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(app)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-canvas/60 py-2 hover:bg-halt"
                    >
                        <Icon icon={faTrashCan} /> Delete
                    </button>
                </div>
            </div>

            {/* Desktop: a table row with the original hover colours */}
            <div
                className={cn(
                    'group hidden h-20 overflow-hidden bg-raised text-xl transition-[scale,border-radius] duration-500 hover:scale-[1.03] hover:rounded-lg md:grid',
                    COLUMNS,
                )}
            >
                <span className="flex items-center px-4 transition-colors duration-500 group-hover:bg-highlight group-hover:text-canvas">
                    {number}.
                </span>
                <span className="flex min-w-0 items-center px-4">
                    <span className="truncate" title={app.info.name}>
                        {app.info.name}
                    </span>
                </span>
                <span className="flex min-w-0 items-center gap-1 px-4">
                    <code className="truncate font-mono text-base select-text" title={app.id}>
                        {app.id}
                    </code>
                    <CopyButton value={app.id} label={`Copy app ID for ${app.info.name}`} />
                </span>
                <span className="flex items-center justify-center">
                    <Switch
                        size="sm"
                        label={`Public: ${app.info.name}`}
                        checked={app.isGlobal}
                        onCheckedChange={(checked) => onVisibilityChange(app, checked)}
                    />
                </span>
                <Link
                    href={viewHref}
                    aria-label={`View ${app.info.name}`}
                    className={cn(iconCell, 'hover:bg-[lime] hover:text-canvas')}
                >
                    <Icon icon={faEye} />
                </Link>
                <Link
                    href={editHref}
                    aria-label={`Edit ${app.info.name}`}
                    className={cn(iconCell, 'hover:bg-[yellow] hover:text-canvas')}
                >
                    <Icon icon={faPencil} />
                </Link>
                <button
                    type="button"
                    aria-label={`Delete ${app.info.name}`}
                    onClick={() => onDelete(app)}
                    className={cn(iconCell, 'group-hover:bg-halt')}
                >
                    <Icon icon={faTrashCan} />
                </button>
            </div>
        </li>
    );
}

interface ConsoleAppsProps {
    initialPage: Page<AppSummary>;
    total: number;
}

export function ConsoleApps({ initialPage, total: initialTotal }: ConsoleAppsProps) {
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZE.console);
    const [total, setTotal] = useState(initialTotal);
    const [pendingDelete, setPendingDelete] = useState<AppSummary | null>(null);
    const [deleting, startDeleting] = useTransition();

    const showAll = pageSize === 0;
    const chunkSize = showAll ? PAGE_SIZE.apiMax : pageSize;
    const fetchPage = useCallback(
        (cursor: string, signal: AbortSignal) => fetchAppsPage('mine', cursor, chunkSize, signal),
        [chunkSize],
    );
    const list = useInfiniteList({ initialPage, fetchPage, autoLoad: showAll });
    const { setItems } = list;

    async function changePageSize(value: number) {
        setPageSize(value);
        try {
            list.reset(await fetchAppsPage('mine', null, value === 0 ? PAGE_SIZE.apiMax : value));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not reload your apps.');
        }
    }

    const changeVisibility = useCallback(
        async (app: AppSummary, isGlobal: boolean) => {
            const apply = (value: boolean) =>
                setItems((items) =>
                    items.map((item) => (item.id === app.id ? { ...item, isGlobal: value } : item)),
                );

            apply(isGlobal);
            const result = await setAppVisibilityAction(app.id, isGlobal);

            if (!result.ok) {
                apply(!isGlobal);
                toast.error(result.error);
                return;
            }
            toast.success(`${app.info.name} is now ${isGlobal ? 'public' : 'private'}.`);
        },
        [setItems],
    );

    function confirmDelete() {
        const app = pendingDelete;
        if (!app) return;

        startDeleting(async () => {
            const result = await deleteAppAction(app.id);

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            setItems((items) => items.filter((item) => item.id !== app.id));
            setTotal((count) => Math.max(0, count - 1));
            setPendingDelete(null);
            toast.success(`Deleted ${app.info.name}.`);
        });
    }

    return (
        <div className="font-mars-mono">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="flex items-center gap-3 text-3xl sm:text-4xl">
                    <Icon icon={faTable} />
                    Game List
                    <span
                        aria-label={`${total} apps`}
                        className="grid h-9 min-w-[3ch] place-items-center rounded-lg bg-halt px-2 text-xl leading-none"
                    >
                        {total}
                    </span>
                </h1>
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href="/create-app"
                        variant="secondary"
                        size="icon"
                        aria-label="Create a new app"
                        className="rounded-full font-mars-mono"
                    >
                        <Icon icon={faPlus} />
                    </ButtonLink>
                    <Dropdown<number>
                        label="How many apps to load at a time"
                        options={CONSOLE_PAGE_SIZES}
                        value={pageSize}
                        onChange={changePageSize}
                        className="z-30 text-xl"
                        theme={{
                            color: '#ffffff',
                            background: '#282a2c',
                            hover: '#3a3d41',
                            selected: '#46484e',
                            // Outlined so it doesn't blend into the Game List rows it opens over.
                            border: '2px solid #5b6068',
                        }}
                    />
                </div>
            </div>

            <ul className="mt-8 flex flex-col gap-3 md:gap-[5px]">
                <li
                    aria-hidden
                    className={cn(
                        'hidden h-20 items-center rounded-t-lg bg-raised text-xl md:grid [&>span]:px-4',
                        COLUMNS,
                    )}
                >
                    <span>NO.</span>
                    <span>TITLE</span>
                    <span>APP ID</span>
                    <span className="text-center">PUBLIC</span>
                    <span className="text-center">VIEW</span>
                    <span className="text-center">EDIT</span>
                    <span className="text-center">DELETE</span>
                </li>

                {list.items.map((app, index) => (
                    <AppRow
                        key={app.id}
                        app={app}
                        number={index + 1}
                        index={index % chunkSize}
                        onVisibilityChange={changeVisibility}
                        onDelete={setPendingDelete}
                    />
                ))}
            </ul>

            {list.items.length === 0 ? (
                <div className="mt-3 flex min-h-[40svh] flex-col items-center justify-center gap-5 rounded-xl bg-raised p-8 text-center text-2xl md:-mt-[5px] md:rounded-t-none">
                    There is nothing here.
                    <ButtonLink href="/create-app" className="font-mars-mono">
                        <Icon icon={faPlus} /> Create your first app
                    </ButtonLink>
                </div>
            ) : (
                <ListFooter
                    hasMore={list.hasMore}
                    status={list.status}
                    onLoadMore={list.loadMore}
                    sentinelRef={showAll ? list.sentinelRef : undefined}
                    loadMoreLabel={`Load ${chunkSize} more`}
                    endLabel={`Showing all ${list.items.length} of ${total}`}
                />
            )}

            <Dialog
                open={pendingDelete !== null}
                onClose={() => (deleting ? undefined : setPendingDelete(null))}
                title={`Delete ${pendingDelete?.info.name ?? 'this app'}?`}
                description="Its leaderboard and every score in it will be removed permanently. Games still using its App ID will start getting 404 errors."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            disabled={deleting}
                            aria-busy={deleting}
                        >
                            <Icon icon={faTrashCan} /> {deleting ? 'Deleting…' : 'Delete app'}
                        </Button>
                    </>
                }
            />
        </div>
    );
}
