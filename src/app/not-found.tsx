import type { Metadata } from 'next';
import { Footer } from '@/components/layout/footer';
import { ButtonLink } from '@/components/ui/button';
import { TrafficLight } from '@/components/ui/status';
import { AppStatus } from '@/lib/domain';

export const metadata: Metadata = {
    title: 'Page not found',
    robots: { index: false },
};

export default function NotFound() {
    return (
        <>
            <main
                id="main"
                className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 pt-14 text-center"
            >
                <TrafficLight status={AppStatus.Disabled} scale={2} className="animate-pop-in gap-4" />
                <p className="animate-pop-in font-mars text-8xl sm:text-9xl">404</p>
                <h1 className="max-w-md animate-fade-up text-2xl text-balance">
                    This page wandered off the leaderboard.
                </h1>
                <p className="max-w-md animate-fade-up font-pixel-sm text-muted [animation-delay:100ms]">
                    The link might be broken, or the app it pointed to is private or was deleted.
                </p>
                <div className="flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:200ms]">
                    <ButtonLink href="/">Back home</ButtonLink>
                    <ButtonLink href="/apps" variant="secondary">
                        Browse apps
                    </ButtonLink>
                </div>
            </main>
            <Footer />
        </>
    );
}
