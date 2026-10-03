import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/layout/page-transition';
import { LeaderboardHeader } from '@/components/leaderboard/leaderboard-header';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { PAGE_SIZE } from '@/lib/constants';
import { getViewableAppForRequest, toAppSummary } from '@/server/services/apps';
import { countPlayers, getLeaderboardPage } from '@/server/services/leaderboard';

export async function generateMetadata({ params }: PageProps<'/app/[app_id]'>): Promise<Metadata> {
    const { app_id: appId } = await params;
    const { app } = await getViewableAppForRequest(appId);

    if (!app) return { title: 'App not found', robots: { index: false } };

    return {
        title: `${app.info.name} leaderboard`,
        description: app.info.description,
        robots: app.isGlobal ? undefined : { index: false, follow: false },
    };
}

export default async function LeaderboardPage({ params }: PageProps<'/app/[app_id]'>) {
    const { app_id: appId } = await params;
    // Memoized per request, so this shares its reads with generateMetadata.
    const { app, viewer } = await getViewableAppForRequest(appId);

    if (!app) notFound();

    const isOwner = viewer?.email === app.ownerId;
    const [initialPage, total] = await Promise.all([
        getLeaderboardPage(app.id, null, PAGE_SIZE.leaderboard),
        countPlayers(app.id),
    ]);

    return (
        <PageTransition>
            <div className="flex justify-center font-mars">
                <section className="min-h-svh w-full max-w-[60rem] bg-surface px-3 sm:px-8">
                    <LeaderboardHeader app={toAppSummary(app)} total={total} isOwner={isOwner} />
                    <LeaderboardTable
                        appId={app.id}
                        initialPage={initialPage}
                        total={total}
                        canModerate={isOwner}
                    />
                </section>
            </div>
        </PageTransition>
    );
}
