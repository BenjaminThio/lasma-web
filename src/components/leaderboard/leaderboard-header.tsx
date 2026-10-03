import type { Route } from 'next';
import { TagChip } from '@/components/apps/app-card';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faLock, faPencil } from '@/components/ui/icons';
import { SmartImage } from '@/components/ui/smart-image';
import { PlatformBadge, TrafficLight } from '@/components/ui/status';
import { APP_STATUS_META, APP_TAG_LABEL, type AppSummary } from '@/lib/domain';
import { pluralize } from '@/lib/format';

interface LeaderboardHeaderProps {
    app: AppSummary;
    total: number;
    isOwner: boolean;
}

export function LeaderboardHeader({ app, total, isOwner }: LeaderboardHeaderProps) {
    return (
        <header className="flex animate-fade-up flex-col gap-5 pt-6 pb-4 font-pixel sm:flex-row sm:items-center sm:pt-10">
            <SmartImage
                src={app.thumbnailUrl}
                alt=""
                fill
                unoptimized
                priority
                draggable={false}
                wrapperClassName="size-20 shrink-0 rounded-xl bg-black sm:size-24"
                className="object-cover pixelated"
            />
            <div className="min-w-0 grow">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h1 className="truncate text-3xl font-bold sm:text-4xl">{app.info.name}</h1>
                    <TrafficLight status={app.info.status} />
                    <span className="sr-only">{APP_STATUS_META[app.info.status].label}</span>
                </div>
                <p className="mt-2 font-pixel-sm text-muted sm:text-lg">{app.info.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-[0.3rem] bg-raised px-2 py-1">{pluralize(total, 'player')}</span>
                    <TagChip>{APP_TAG_LABEL[app.info.tag]}</TagChip>
                    <PlatformBadge platforms={app.info.platforms} tone="soft" />
                    {app.isGlobal ? null : (
                        <span className="flex items-center gap-1.5 rounded-[0.3rem] bg-building/15 px-2 py-1 text-building">
                            <Icon icon={faLock} /> Private
                        </span>
                    )}
                </div>
            </div>
            {isOwner ? (
                <ButtonLink
                    href={`/app/${app.id}/edit` as Route}
                    variant="secondary"
                    size="sm"
                    className="self-start sm:self-center"
                >
                    <Icon icon={faPencil} /> Edit app
                </ButtonLink>
            ) : null}
        </header>
    );
}
