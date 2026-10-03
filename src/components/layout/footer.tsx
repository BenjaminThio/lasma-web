import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { faFacebook, faGithub, faInstagram, faMugHot } from '@/components/ui/icons';
import { Container } from '@/components/ui/primitives';
import { GAME_LIST } from '@/config/games';
import { siteConfig, type SocialNetwork } from '@/config/site';
import { GameLink } from '@/components/games/game-link';

const SOCIAL_ICONS: Record<SocialNetwork, { icon: IconDefinition; label: string }> = {
    instagram: { icon: faInstagram, label: 'Instagram' },
    facebook: { icon: faFacebook, label: 'Facebook' },
    github: { icon: faGithub, label: 'GitHub' },
};

function Column({ title, children }: { title: ReactNode; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xl font-bold">{title}</p>
            {children}
        </div>
    );
}

const linkClasses = 'w-fit text-lg text-white/90 transition-colors hover:text-accent';

export function Footer() {
    const year = new Date().getFullYear();
    const years = year > siteConfig.foundedYear ? `${siteConfig.foundedYear} - ${year}` : `${year}`;

    return (
        <footer className="bg-surface">
            <Container className="flex flex-col gap-12 py-14 sm:py-20">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="flex flex-col gap-8">
                        <Column title="Brand">
                            <p className="text-lg">Lasma {years} © All rights reserved</p>
                        </Column>
                        <Column title="Product">
                            <ul className="flex flex-col gap-2">
                                <li>
                                    <Link href="/apps" className={linkClasses}>
                                        Apps gallery
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/docs" className={linkClasses}>
                                        API docs
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy" className={linkClasses}>
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className={linkClasses}>
                                        Terms
                                    </Link>
                                </li>
                            </ul>
                        </Column>
                        <Column title="Other Projects">
                            <ul className="flex flex-col gap-2">
                                <li>
                                    <Link href="/pop-yi-fan" className={linkClasses}>
                                        Pop Yi Fan
                                    </Link>
                                </li>
                                {GAME_LIST.map((game) => (
                                    <li key={game.slug}>
                                        <GameLink game={game} className={linkClasses}>
                                            {game.title}
                                        </GameLink>
                                    </li>
                                ))}
                            </ul>
                        </Column>
                    </div>

                    <Column title="The Only Developer">
                        <p className="text-lg">{siteConfig.author}</p>
                    </Column>

                    <Column title="Copyrights">
                        <ul className="flex flex-col gap-2 text-lg">
                            <li>
                                Fonts{' '}
                                <span className="font-pixel-sm text-base text-muted">
                                    · Fusion Pixel (OFL)
                                </span>
                            </li>
                            <li>
                                Icons{' '}
                                <span className="font-pixel-sm text-base text-muted">
                                    · Font Awesome Free
                                </span>
                            </li>
                            <li>
                                Games{' '}
                                <span className="font-pixel-sm text-base text-muted">
                                    · Godot &amp; Unity
                                </span>
                            </li>
                        </ul>
                    </Column>

                    <div className="flex flex-col gap-8">
                        <Column title="About Me">
                            <ul className="flex gap-4">
                                {(Object.keys(SOCIAL_ICONS) as SocialNetwork[]).map((network) => {
                                    const { icon, label } = SOCIAL_ICONS[network];
                                    const href = siteConfig.social[network];
                                    const classes =
                                        'grid size-9 place-items-center rounded-full bg-chip text-lg transition-[scale,background-color,color]';

                                    return (
                                        <li key={network}>
                                            {href ? (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={label}
                                                    className={`${classes} hover:scale-110 hover:bg-accent hover:text-canvas`}
                                                >
                                                    <Icon icon={icon} />
                                                </a>
                                            ) : (
                                                <span
                                                    className={`${classes} text-white/70`}
                                                    title={`${label} — coming soon`}
                                                    aria-label={`${label} (coming soon)`}
                                                    role="img"
                                                >
                                                    <Icon icon={icon} />
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </Column>
                        <Column
                            title={
                                <>
                                    Buy Me a Coffee <Icon icon={faMugHot} />
                                </>
                            }
                        >
                            {siteConfig.buyMeACoffee ? (
                                <a
                                    href={siteConfig.buyMeACoffee}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={linkClasses}
                                >
                                    Support the studio
                                </a>
                            ) : (
                                <p className="text-lg text-white/70">No Link Provided</p>
                            )}
                        </Column>
                    </div>
                </div>

                <p className="border-t border-white/5 pt-8 text-center text-lg">
                    Built with love by {siteConfig.author} © {years}
                </p>
            </Container>
        </footer>
    );
}
