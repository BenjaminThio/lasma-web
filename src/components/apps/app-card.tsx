import type { Route } from 'next';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/primitives';
import { SmartImage } from '@/components/ui/smart-image';
import { PlatformBadge, TrafficLight } from '@/components/ui/status';
import { cn } from '@/lib/cn';
import { APP_TAG_LABEL, type AppSummary } from '@/lib/domain';

export const APP_GRID_CLASSES =
    'grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 xs:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] sm:gap-y-6';

interface AppCardFrameProps {
    media: ReactNode;
    status?: ReactNode;
    platforms?: ReactNode;
    title: ReactNode;
    tag: ReactNode;
    description: ReactNode;
    footer?: ReactNode;
    className?: string;
}

/**
 * The app card layout (12rem × 17rem in the original design), shared by the gallery card and the
 * create/edit editor so both always look identical.
 */
export function AppCardFrame({
    media,
    status,
    platforms,
    title,
    tag,
    description,
    footer,
    className,
}: AppCardFrameProps) {
    return (
        <div
            className={cn(
                'relative flex aspect-[12/17] min-h-0 w-full flex-col gap-2 rounded-2xl bg-surface p-2 text-left',
                className,
            )}
        >
            <div className="relative flex flex-col">
                <div className="relative aspect-[176/162] w-full">
                    {/* Only the image is clipped, so overlays like the platform menu can extend past it. */}
                    <div className="absolute inset-0 overflow-hidden rounded-t-lg bg-black">{media}</div>
                    {status ? <div className="absolute top-2 left-2 z-10">{status}</div> : null}
                    {platforms ? <div className="absolute bottom-2 left-2 z-20">{platforms}</div> : null}
                </div>
                <div className="flex h-9 items-center justify-center rounded-b-lg bg-raised px-2 text-base font-bold sm:text-lg">
                    {title}
                </div>
            </div>
            <div className="absolute -top-[5px] -right-[5px] z-20">{tag}</div>
            <div className="flex min-h-0 grow gap-1.5 overflow-hidden rounded-lg bg-raised p-1.5 font-pixel-sm text-xs leading-[1.2]">
                {description}
            </div>
            {footer}
        </div>
    );
}

export function TagChip({ children }: { children: ReactNode }) {
    return (
        <span className="block rounded-[0.3rem] bg-raised p-[0.3rem] text-sm leading-none">{children}</span>
    );
}

interface AppCardProps {
    app: AppSummary;
    href?: Route;
    /** Position within its loaded chunk, used to stagger the pop-in animation. */
    index?: number;
    priority?: boolean;
}

export function AppCard({ app, href, index = 0, priority = false }: AppCardProps) {
    const card = (
        <AppCardFrame
            className="transition-[translate,box-shadow] duration-300 ease-out-quint group-hover:-translate-y-1 group-hover:shadow-float"
            media={
                <SmartImage
                    src={app.thumbnailUrl}
                    alt=""
                    fill
                    unoptimized
                    priority={priority}
                    draggable={false}
                    wrapperClassName="absolute inset-0"
                    className="object-cover pixelated"
                />
            }
            status={<TrafficLight status={app.info.status} />}
            platforms={<PlatformBadge platforms={app.info.platforms} className="bg-black/35" />}
            title={<span className="truncate">{app.info.name}</span>}
            tag={<TagChip>{APP_TAG_LABEL[app.info.tag]}</TagChip>}
            description={
                <>
                    <span aria-hidden>*</span>
                    <p className="line-clamp-1 break-all sm:line-clamp-2">{app.info.description}</p>
                </>
            }
        />
    );

    const style = { '--i': index } as CSSProperties;

    if (!href) {
        return (
            <div className="w-full max-w-48 animate-pop-in stagger" style={style}>
                {card}
            </div>
        );
    }

    return (
        <Link
            href={href}
            aria-label={`${app.info.name} leaderboard`}
            className="group block w-full max-w-48 animate-pop-in rounded-2xl stagger focus-visible:outline-offset-4"
            style={style}
        >
            {card}
        </Link>
    );
}

export function AppCardSkeleton() {
    return (
        <div aria-hidden className="w-full max-w-48">
            <AppCardFrame
                media={<Skeleton className="absolute inset-0 rounded-none" />}
                title={<Skeleton className="h-4 w-3/4" />}
                tag={<Skeleton className="h-6 w-10 rounded-[0.3rem]" />}
                description={<Skeleton className="h-3 w-full" />}
            />
        </div>
    );
}
