'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { TrafficLight } from '@/components/ui/status';
import { AppStatus } from '@/lib/domain';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main
            id="main"
            className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 pt-14 text-center"
        >
            <TrafficLight status={AppStatus.UnderConstruction} scale={2} className="animate-pop-in gap-4" />
            <h1 className="animate-fade-up text-3xl">Something broke on our side.</h1>
            <p className="max-w-md animate-fade-up font-pixel-sm text-muted">
                Try again in a moment. If it keeps happening, the reference below helps us find it.
            </p>
            {error.digest ? (
                <code className="rounded bg-raised px-2 py-1 text-sm text-muted select-all">
                    {error.digest}
                </code>
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={reset}>Try again</Button>
                <ButtonLink href="/" variant="secondary">
                    Back home
                </ButtonLink>
            </div>
        </main>
    );
}
