import type { Metadata } from 'next';
import { GamePage } from '@/components/games/game-page';
import { GAMES } from '@/config/games';

const game = GAMES['stop-syurga'];

export const metadata: Metadata = {
    title: game.title,
    description: `Play ${game.title}, a ${game.engine} game by LASMA Studio, in your browser.`,
};

export default function Page() {
    return <GamePage game={game} />;
}
