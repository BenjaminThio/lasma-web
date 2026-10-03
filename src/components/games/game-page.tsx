import { PageTransition } from '@/components/layout/page-transition';
import { Container } from '@/components/ui/primitives';
import type { Game } from '@/config/games';
import { GameFrame } from './game-frame';

export function GamePage({ game }: { game: Game }) {
    return (
        <PageTransition>
            <Container className="flex min-h-[calc(100svh-3.5rem)] max-w-[64rem] flex-col justify-center gap-6 py-8 sm:py-12">
                <header className="flex animate-fade-up flex-wrap items-baseline justify-between gap-2">
                    <h1 className="text-3xl font-bold sm:text-4xl">{game.title}</h1>
                    <p className="font-pixel-sm text-muted">
                        {game.engine} · ~{game.downloadMb} MB
                    </p>
                </header>
                <GameFrame game={game} />
            </Container>
        </PageTransition>
    );
}
