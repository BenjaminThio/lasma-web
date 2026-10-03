'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faExpand, faGamepad } from '@/components/ui/icons';
import { LoadingDots } from '@/components/ui/primitives';
import type { Game } from '@/config/games';
import { useIsClient } from '@/hooks/use-is-client';
import { cn } from '@/lib/cn';

const RELOAD_FLAG = 'lasma:isolation-reload';

function needsIsolationReload(game: Game): boolean {
    return game.requiresIsolation && typeof window !== 'undefined' && !window.crossOriginIsolated;
}

/**
 * Embeds a static game export responsively (16:10, like the original 960×600 frame) with a loading
 * overlay and a fullscreen button.
 */
export function GameFrame({ game }: { game: Game }) {
    const isClient = useIsClient();
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [loaded, setLoaded] = useState(false);
    const mustReload = isClient && needsIsolationReload(game);

    useEffect(() => {
        if (!game.requiresIsolation) return;

        if (window.crossOriginIsolated) {
            sessionStorage.removeItem(RELOAD_FLAG);
            return;
        }

        // Threads need a cross-origin isolated document, and those headers only apply on a full load.
        // Reload once; the flag prevents a loop if the server isn't sending the headers.
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
            sessionStorage.setItem(RELOAD_FLAG, '1');
            window.location.reload();
        }
    }, [game.requiresIsolation]);

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black shadow-glow">
                {isClient && !mustReload ? (
                    <iframe
                        ref={frameRef}
                        src={game.embedSrc}
                        title={game.title}
                        allow="fullscreen; autoplay; gamepad; cross-origin-isolated"
                        onLoad={() => setLoaded(true)}
                        className={cn(
                            'absolute inset-0 size-full border-0 transition-opacity duration-500',
                            loaded ? 'opacity-100' : 'opacity-0',
                        )}
                    />
                ) : null}

                {loaded ? null : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-dot-grid text-center">
                        <Icon icon={faGamepad} className="animate-breathe text-5xl text-accent" />
                        <p className="text-lg">
                            Loading {game.title}
                            <LoadingDots />
                        </p>
                        <p className="font-pixel-sm text-sm text-muted">
                            About {game.downloadMb} MB on the first visit
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-pixel-sm text-sm text-muted">
                    Built with {game.engine}. Plays best with a keyboard and mouse.
                </p>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={!loaded}
                    onClick={() => void frameRef.current?.requestFullscreen?.()}
                >
                    <Icon icon={faExpand} /> Fullscreen
                </Button>
            </div>
        </div>
    );
}
