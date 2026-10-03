import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { faGlobe, faKey, faRankingStar, faShieldHalved, faSignal, faCode } from '@/components/ui/icons';
import { Container, LoadingDots, SectionHeading, Skeleton } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/cn';
import { PAGE_SIZE } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import { StatusCycler, VisibilityDemo } from './feature-demos';

const TOP_PLAYERS = [
    { rank: 1, name: 'Benjamin Thio', score: 999 },
    { rank: 2, name: 'Teh Yi Fan', score: 980 },
    { rank: 3, name: 'Loh Zen Thye', score: 975 },
    { rank: 4, name: 'Law Choon Hong', score: 960 },
    { rank: 5, name: 'Mei Nova42', score: 944 },
];

const RANK_COLORS = ['text-gold', 'text-silver', 'text-bronze'];

function MiniLeaderboard() {
    return (
        <div className="flex flex-col gap-[5px] font-mars text-lg">
            {TOP_PLAYERS.map((player) => (
                <div key={player.rank} className="flex h-12 items-center gap-3 rounded-md bg-raised px-4">
                    <span className={cn('w-8', RANK_COLORS[player.rank - 1])}>{player.rank}.</span>
                    <span className="grow truncate">{player.name}</span>
                    <span className="tabular-nums">{formatNumber(player.score)}</span>
                </div>
            ))}
            <div aria-hidden className="flex h-12 items-center gap-3 rounded-md bg-raised px-4">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-3 grow" />
                <Skeleton className="h-3 w-10" />
            </div>
            <p className="pt-2 text-center font-pixel-sm text-sm text-subtle">
                Loading the next {PAGE_SIZE.leaderboard}
                <LoadingDots />
            </p>
        </div>
    );
}

function CodeLine({ children }: { children: ReactNode }) {
    return (
        <pre className="overflow-x-auto rounded-xl bg-[#0c0c0d] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
            {children}
        </pre>
    );
}

interface FeatureProps {
    icon: IconDefinition;
    title: string;
    children: ReactNode;
    visual?: ReactNode;
    className?: string;
    delay?: number;
}

function Feature({ icon, title, children, visual, className, delay = 0 }: FeatureProps) {
    return (
        <Reveal
            delay={delay}
            className={cn(
                'flex flex-col rounded-2xl border border-white/[0.06] bg-surface p-6 transition-colors duration-300 hover:border-white/15',
                className,
            )}
        >
            <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Icon icon={icon} />
                </span>
                <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <p className="mt-3 font-pixel-sm leading-relaxed text-muted">{children}</p>
            {visual ? <div className="mt-6 grow">{visual}</div> : null}
        </Reveal>
    );
}

export function Features() {
    return (
        <section id="features" className="scroll-mt-20 border-t border-white/5 bg-surface/30">
            <Container className="py-24 sm:py-32">
                <Reveal>
                    <SectionHeading
                        eyebrow="features"
                        title="The boring parts, handled."
                        description="Ranking, paging, spam limits and key checks all happen on our side, so your game only has to send one request."
                    />
                </Reveal>

                <div className="mt-14 grid gap-4 md:grid-cols-6">
                    <Feature
                        icon={faRankingStar}
                        title="Rankings that page, not lag"
                        className="md:col-span-4 md:row-span-2"
                        visual={<MiniLeaderboard />}
                    >
                        Boards arrive {PAGE_SIZE.leaderboard} rows at a time and fetch more as players scroll.
                        A board with thousands of entries opens about as fast as one with ten.
                    </Feature>
                    <Feature
                        icon={faSignal}
                        title="Status lights"
                        className="md:col-span-2"
                        delay={80}
                        visual={<StatusCycler />}
                    >
                        Ready, under construction or disabled. Disabled apps stop accepting scores.
                    </Feature>
                    <Feature
                        icon={faGlobe}
                        title="Public or private"
                        className="md:col-span-2"
                        delay={160}
                        visual={<VisibilityDemo />}
                    >
                        Private apps stay out of the gallery. Your game can still read and write.
                    </Feature>
                    <Feature
                        icon={faKey}
                        title="Write keys"
                        className="md:col-span-2"
                        visual={
                            <CodeLine>
                                <span className="text-syntax-key">X-Api-Key</span>:{' '}
                                <span className="text-syntax-string">lsk_••••••••••</span>
                            </CodeLine>
                        }
                    >
                        Every change needs the app&apos;s secret key. Lost it or leaked it? Rotate it from the
                        console.
                    </Feature>
                    <Feature
                        icon={faShieldHalved}
                        title="Rate limited"
                        className="md:col-span-2"
                        delay={80}
                        visual={
                            <CodeLine>
                                <span className="text-danger">429</span> Too Many Requests{'\n'}
                                <span className="text-muted">Retry-After: 12</span>
                            </CodeLine>
                        }
                    >
                        Each IP gets 60 writes a minute per app, so one player can&apos;t flood your board.
                    </Feature>
                    <Feature
                        icon={faCode}
                        title="CORS-ready"
                        className="md:col-span-2"
                        delay={160}
                        visual={
                            <CodeLine>
                                <span className="text-syntax-key">Access-Control-Allow-Origin</span>:{' '}
                                <span className="text-syntax-string">*</span>
                            </CodeLine>
                        }
                    >
                        Call the API straight from web builds on itch.io, Newgrounds or your own domain.
                    </Feature>
                </div>
            </Container>
        </section>
    );
}
