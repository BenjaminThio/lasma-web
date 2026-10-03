import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { faBolt, faKey, faRankingStar } from '@/components/ui/icons';
import { LightBulb } from '@/components/ui/status';

const HIGHLIGHTS = [
    { icon: faRankingStar, text: 'A hosted leaderboard per game, paged so it stays fast at any size.' },
    { icon: faKey, text: 'Write keys are hashed and shown once. Nobody else can post to your board.' },
    { icon: faBolt, text: 'Plain HTTP: Godot, Unity, GameMaker, the browser, or cURL.' },
];

const PREVIEW_ROWS = [
    { rank: 1, name: 'PixelNova', score: '98,410', className: 'text-gold' },
    { rank: 2, name: 'EchoRune', score: '91,275', className: 'text-silver' },
    { rank: 3, name: 'GlitchKai', score: '88,020', className: 'text-bronze' },
];

function BrandPanel() {
    return (
        <aside className="hidden flex-col gap-8 lg:flex">
            <div className="flex flex-col gap-4">
                <p className="font-pixel-sm text-sm tracking-widest text-accent uppercase">
                    {'// lasma studio'}
                </p>
                <h2 className="max-w-md text-4xl leading-tight font-bold text-balance">
                    Leaderboards for the games you ship.
                </h2>
                <p className="max-w-md font-pixel-sm text-lg leading-relaxed text-muted">
                    One account runs every board. Create an app, copy its key, and your players&apos; scores
                    show up here.
                </p>
            </div>

            <div
                aria-hidden
                className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-surface p-3 font-mars shadow-float"
            >
                <div className="mb-2 flex items-center justify-between px-2 pt-1 font-pixel text-sm">
                    <span>Neon Drift</span>
                    <span className="flex gap-1.5">
                        <LightBulb color={null} />
                        <LightBulb color={null} />
                        <LightBulb color="#00ff7f" />
                    </span>
                </div>
                <ol className="flex flex-col gap-[5px] text-lg">
                    {PREVIEW_ROWS.map((row) => (
                        <li key={row.rank} className="flex h-12 items-center gap-4 rounded-lg bg-raised px-4">
                            <span className={row.className}>{row.rank}.</span>
                            <span className="grow">{row.name}</span>
                            <span className="tabular-nums">{row.score}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <ul className="flex max-w-md flex-col gap-3">
                {HIGHLIGHTS.map((item) => (
                    <li key={item.text} className="flex items-start gap-3 font-pixel-sm text-muted">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                            <Icon icon={item.icon} />
                        </span>
                        <span className="pt-1 leading-snug">{item.text}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

/** Login, sign-up and password recovery: the form card, with a product panel beside it on wide screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main id="main" className="relative isolate min-h-svh overflow-hidden pt-14">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-line-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgb(255_210_0/0.07),transparent_70%)]"
            />
            <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] w-full max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
                <BrandPanel />
                <div className="flex justify-center">{children}</div>
            </div>
        </main>
    );
}
