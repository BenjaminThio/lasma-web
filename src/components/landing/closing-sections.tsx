import Link from 'next/link';
import { GameLink } from '@/components/games/game-link';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faArrowRight } from '@/components/ui/icons';
import { Container, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { SmartImage } from '@/components/ui/smart-image';
import { LightBulb } from '@/components/ui/status';
import { yiFanClosed } from '@/config/assets';
import { GAME_LIST } from '@/config/games';
import { cn } from '@/lib/cn';

const tileClasses =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface transition-[translate,border-color] duration-300 ease-out-quint hover:-translate-y-1 hover:border-white/15';

function TileFooter({ title, meta }: { title: string; meta: string }) {
    return (
        <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
                <p className="line-clamp-2 text-lg leading-snug" title={title}>
                    {title}
                </p>
                <p className="font-pixel-sm text-sm text-muted">{meta}</p>
            </div>
            <Icon
                icon={faArrowRight}
                className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
            />
        </div>
    );
}

export function Showcase() {
    return (
        <section id="games" className="scroll-mt-20 border-t border-white/5 bg-surface/30">
            <Container className="py-24 sm:py-32">
                <Reveal>
                    <SectionHeading
                        eyebrow="from the studio"
                        title="Play something while you're here."
                        description="Games and toys made at LASMA. They all run in the browser; the bigger ones are a hefty first download."
                    />
                </Reveal>
                <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    {GAME_LIST.map((game, index) => (
                        <Reveal as="li" key={game.slug} delay={index * 60}>
                            <GameLink game={game} className={tileClasses}>
                                <div className="relative grid aspect-square place-items-center overflow-hidden bg-canvas bg-dot-grid">
                                    <SmartImage
                                        src={game.icon}
                                        alt=""
                                        fill
                                        sizes="(min-width: 1024px) 14rem, (min-width: 480px) 45vw, 90vw"
                                        wrapperClassName={cn(
                                            'absolute transition-transform duration-500 group-hover:scale-105',
                                            game.iconFit === 'cover' ? 'inset-0' : 'inset-[18%]',
                                        )}
                                        className={
                                            game.iconFit === 'cover' ? 'object-cover' : 'object-contain'
                                        }
                                    />
                                </div>
                                <TileFooter
                                    title={game.title}
                                    meta={`${game.engine} · ${game.downloadMb} MB`}
                                />
                            </GameLink>
                        </Reveal>
                    ))}
                    <Reveal as="li" delay={GAME_LIST.length * 60}>
                        <Link href="/pop-yi-fan" className={tileClasses}>
                            <div className="relative grid aspect-square place-items-center overflow-hidden bg-canvas bg-dot-grid">
                                <SmartImage
                                    src={yiFanClosed}
                                    alt=""
                                    fill
                                    sizes="(min-width: 1024px) 14rem, 45vw"
                                    wrapperClassName="absolute inset-[14%] transition-transform duration-[2000ms] group-hover:rotate-[360deg]"
                                    className="object-contain"
                                />
                            </div>
                            <TileFooter title="Pop Yi Fan" meta="Tap, pop, repeat" />
                        </Link>
                    </Reveal>
                </ul>
            </Container>
        </section>
    );
}

const QUESTIONS: { question: string; answer: string }[] = [
    {
        question: 'Do players need an account?',
        answer: 'No. Your game sends a name and a score. Accounts are only for developers who manage apps.',
    },
    {
        question: "How do I update a player's score instead of adding a new row?",
        answer: 'Keep the id from success.id in the first response. Send it back as playerId with POST (which updates the player if they exist) or with PUT.',
    },
    {
        question: 'What stops people from spamming my board?',
        answer: "Writes need your app's write key, each IP is limited to 60 writes a minute per app, and you can switch an app to Disabled at any time. If a key leaks, generate a new one from the app's edit page.",
    },
    {
        question: 'Can I hide an app from the gallery?',
        answer: 'Yes. Turn off Public in the console. Its leaderboard page becomes visible only to you, and the API keeps working for your game.',
    },
    {
        question: 'I made an app before write keys existed. Will my game break?',
        answer: 'No. Older apps keep accepting scores without a key until you generate one on the edit page. From then on the key is required.',
    },
];

export function Faq() {
    return (
        <section id="faq" className="scroll-mt-20 border-t border-white/5">
            <Container className="grid gap-12 py-24 sm:py-32 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <Reveal>
                    <SectionHeading eyebrow="faq" title="Questions, answered." />
                </Reveal>
                <div className="flex flex-col gap-3">
                    {QUESTIONS.map((item, index) => (
                        <Reveal key={item.question} delay={index * 50}>
                            <details className="group rounded-xl border border-white/[0.06] bg-surface transition-colors open:border-white/15">
                                <summary className="flex list-none items-center justify-between gap-4 p-5 text-lg [&::-webkit-details-marker]:hidden">
                                    {item.question}
                                    <span
                                        aria-hidden
                                        className="text-2xl leading-none text-accent transition-transform duration-300 group-open:rotate-45"
                                    >
                                        +
                                    </span>
                                </summary>
                                <p className="px-5 pb-5 font-pixel-sm leading-relaxed text-muted">
                                    {item.answer}
                                </p>
                            </details>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    );
}

export function CallToAction({ signedIn }: { signedIn: boolean }) {
    return (
        <section className="border-t border-white/5">
            <Container className="py-24 sm:py-32">
                <Reveal className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface bg-dot-grid px-6 py-16 text-center sm:px-12 sm:py-20">
                    <span aria-hidden className="absolute top-6 left-6 flex gap-2">
                        <LightBulb color="#ff0000" />
                        <LightBulb color="#ffa500" />
                        <LightBulb color="#00ff7f" />
                    </span>
                    <h2 className="mx-auto max-w-3xl text-3xl leading-tight font-bold text-balance sm:text-5xl">
                        Put a leaderboard in tonight&apos;s build.
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl font-pixel-sm text-muted sm:text-lg">
                        Make an account, create an app, send your first score. The API section above is the
                        whole manual.
                    </p>
                    <div className="mt-10 flex flex-col justify-center gap-3 xs:flex-row">
                        <ButtonLink href={signedIn ? '/create-app' : '/auth/sign-up'} size="lg">
                            Create your first app <Icon icon={faArrowRight} />
                        </ButtonLink>
                        <a
                            href="#api"
                            className="inline-flex h-12 items-center justify-center rounded-lg px-6 text-lg transition-colors hover:text-accent"
                        >
                            Read the API
                        </a>
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}

export function EnginesStrip() {
    const engines = ['Godot', 'Unity', 'GameMaker', 'Defold', 'Construct', 'Phaser', 'cURL'];

    return (
        <section aria-label="Works with" className="border-y border-white/5 bg-surface/60">
            <Container className="flex flex-col items-center gap-4 py-7 md:flex-row md:justify-between">
                <p className="font-pixel-sm text-sm tracking-widest whitespace-nowrap text-muted uppercase">
                    Speaks plain HTTP
                </p>
                <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-lg text-muted">
                    {engines.map((engine) => (
                        <li key={engine}>{engine}</li>
                    ))}
                </ul>
            </Container>
        </section>
    );
}
