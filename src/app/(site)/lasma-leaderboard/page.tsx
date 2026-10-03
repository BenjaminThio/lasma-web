import type { Metadata } from 'next';
import Image from 'next/image';
import { PageTransition } from '@/components/layout/page-transition';
import { EmptyLeaderboard, LeaderboardTableShell } from '@/components/leaderboard/leaderboard-table';
import { lasmaLogo } from '@/config/assets';

export const metadata: Metadata = {
    title: 'LASMA Leaderboard',
    description: 'The studio leaderboard.',
};

export default function LasmaLeaderboardPage() {
    return (
        <PageTransition>
            <div className="flex justify-center font-mars">
                <section className="flex min-h-svh w-full max-w-[60rem] flex-col items-center bg-surface px-3 sm:px-8">
                    <Image
                        src={lasmaLogo}
                        alt="LASMA"
                        priority
                        draggable={false}
                        className="my-6 h-auto w-[min(50rem,100%)] animate-pop-in pixelated"
                    />
                    <div className="w-full">
                        <LeaderboardTableShell empty>{null}</LeaderboardTableShell>
                        <EmptyLeaderboard />
                    </div>
                </section>
            </div>
        </PageTransition>
    );
}
