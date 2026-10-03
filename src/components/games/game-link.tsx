import type { ComponentProps } from 'react';
import type { Game } from '@/config/games';

interface GameLinkProps extends Omit<ComponentProps<'a'>, 'href'> {
    game: Game;
}

/**
 * Game pages need cross-origin isolation headers, which only apply on a full page load — a
 * client-side navigation would keep the current (non-isolated) document. So these links
 * intentionally use a plain anchor. `GameFrame` also self-heals if one slips through.
 */
export function GameLink({ game, ...props }: GameLinkProps) {
    return <a href={`/${game.slug}`} {...props} />;
}
