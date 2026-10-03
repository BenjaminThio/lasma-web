import { LeaderboardSkeletonRows, LeaderboardTableShell } from '@/components/leaderboard/leaderboard-table';
import { Skeleton } from '@/components/ui/primitives';

export default function LeaderboardLoading() {
    return (
        <div className="flex justify-center font-mars" aria-busy="true" aria-label="Loading leaderboard">
            <section className="min-h-svh w-full max-w-[60rem] bg-surface px-3 sm:px-8">
                <div className="flex flex-col gap-5 pt-6 pb-4 sm:flex-row sm:items-center sm:pt-10">
                    <Skeleton className="size-20 rounded-xl sm:size-24" />
                    <div className="flex grow flex-col gap-3">
                        <Skeleton className="h-9 w-56" />
                        <Skeleton className="h-5 w-full max-w-sm" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                </div>
                <LeaderboardTableShell>
                    <LeaderboardSkeletonRows count={8} />
                </LeaderboardTableShell>
            </section>
        </div>
    );
}
