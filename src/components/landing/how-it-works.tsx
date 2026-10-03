import type { ReactNode } from 'react';
import { AppCard } from '@/components/apps/app-card';
import { Icon } from '@/components/ui/icon';
import { faClipboard } from '@/components/ui/icons';
import { Container, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { AppStatus, AppTag, type AppSummary } from '@/lib/domain';

const DEMO_APP: AppSummary = {
    id: 'demo',
    isGlobal: true,
    thumbnailUrl: '/images/galaxy.webp',
    info: {
        name: 'Neon Drift',
        description: 'Arcade racer. Beat the clock, top the board.',
        status: AppStatus.Ready,
        tag: AppTag.Web,
        platforms: { windows: true, linux: true, macOs: false, android: false },
    },
};

function KeyRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="font-pixel-sm text-xs tracking-widest text-subtle uppercase">{label}</span>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-raised py-2.5 pr-3 pl-3">
                <code className="truncate text-sm">{value}</code>
                <Icon icon={faClipboard} className="text-muted" />
            </div>
        </div>
    );
}

interface StepProps {
    number: string;
    title: string;
    children: ReactNode;
    visual: ReactNode;
    delay: number;
}

function Step({ number, title, children, visual, delay }: StepProps) {
    return (
        <Reveal
            as="li"
            delay={delay}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface"
        >
            <div className="flex h-72 items-center justify-center overflow-hidden border-b border-white/[0.06] bg-dot-grid px-6">
                {visual}
            </div>
            <div className="flex flex-col gap-2 p-6">
                <p className="text-sm text-accent">{number}</p>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="font-pixel-sm leading-relaxed text-muted">{children}</p>
            </div>
        </Reveal>
    );
}

export function HowItWorks() {
    return (
        <section id="how-it-works" className="scroll-mt-20">
            <Container className="py-24 sm:py-32">
                <Reveal>
                    <SectionHeading
                        eyebrow="how it works"
                        title="From zero to a ranked board in three steps."
                        description="No SDK to vendor, no backend to deploy. If your engine can send an HTTP request, it can talk to LASMA."
                    />
                </Reveal>
                <ol className="mt-14 grid gap-4 md:grid-cols-3">
                    <Step
                        number="01"
                        title="Create an app"
                        delay={0}
                        visual={
                            <div className="w-36 rotate-[-4deg]">
                                <AppCard app={DEMO_APP} />
                            </div>
                        }
                    >
                        Give it a name and a thumbnail, set its status light, and tag the platforms it ships
                        on.
                    </Step>
                    <Step
                        number="02"
                        title="Copy your keys"
                        delay={90}
                        visual={
                            <div className="flex w-full max-w-72 flex-col gap-4">
                                <KeyRow label="App ID" value="8f3c2a1e-6d2b-4c1f-9e7a" />
                                <KeyRow label="Write key" value="lsk_••••••••••••••••" />
                            </div>
                        }
                    >
                        The App ID says which board to use. The write key proves the score came from your
                        game.
                    </Step>
                    <Step
                        number="03"
                        title="Post a score"
                        delay={180}
                        visual={
                            <pre className="w-full max-w-72 rounded-lg bg-[#0c0c0d] p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                <span className="text-syntax-keyword">POST</span> /api/leaderboard
                                {'\n'}
                                <span className="text-muted"> ?appId=8f3c…&amp;name=Mei</span>
                                {'\n'}
                                <span className="text-muted"> &amp;score=</span>
                                <span className="text-syntax-number">1280</span>
                                {'\n\n'}
                                <span className="text-ready">201 Created</span>
                                {'\n'}
                                <span className="text-muted">rank </span>
                                <span className="text-accent">#3</span>
                            </pre>
                        }
                    >
                        Send a player name and a score. The response includes their rank and the top of the
                        board.
                    </Step>
                </ol>
            </Container>
        </section>
    );
}
