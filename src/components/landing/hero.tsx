import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faArrowRight } from '@/components/ui/icons';
import { Container } from '@/components/ui/primitives';
import { siteConfig } from '@/config/site';
import { EditorCard, TerminalCard } from './code-windows';
import { TiltCard } from './tilt-card';
import { Typewriter } from './typewriter';

const EXAMPLE_RESPONSE = JSON.stringify(
    {
        success: {
            id: '4572ab60-9ee1-43fa-b364-37046a00e5e1',
            name: 'Benjamin Thio',
            score: 999,
            datetime: 'Tue, 28 Oct 2025 07:00:12 GMT',
            rank: 1,
        },
        leaderboard: [
            { id: '4572ab60-9ee1-43fa-b364-37046a00e5e1', name: 'Benjamin Thio', score: 999, rank: 1 },
            { id: 'ba9ebdf3-6378-41d8-89e9-5888129b7296', name: 'Teh Yi Fan', score: 980, rank: 2 },
            { id: 'e17dfa31-77fa-4174-96be-4ed909f603eb', name: 'Loh Zen Thye', score: 975, rank: 3 },
            { id: 'b98bbe22-122c-471f-a1ff-6bbb5f726bab', name: 'Law Choon Hong', score: 960, rank: 4 },
        ],
    },
    null,
    2,
);

interface HeroProps {
    signedIn: boolean;
    origin: string;
}

export function Hero({ signedIn, origin }: HeroProps) {
    return (
        <section className="relative isolate overflow-hidden">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-line-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
            />
            <div
                aria-hidden
                className="absolute top-[42rem] left-1/2 -z-10 h-[30rem] w-[60rem] max-w-[160vw] -translate-x-1/2 rounded-full bg-accent/[0.05] blur-3xl"
            />

            <Container className="flex flex-col items-center pt-16 text-center sm:pt-24 lg:pt-32">
                <a
                    href="#api"
                    className="group mb-8 inline-flex animate-pop-in items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pr-3 pl-1 font-pixel-sm text-sm text-muted transition-colors hover:border-accent/40 hover:text-white"
                >
                    <span className="rounded-full bg-accent px-2 py-0.5 text-canvas">NEW</span>
                    Paged boards, write keys &amp; CORS
                    <Icon icon={faArrowRight} className="transition-transform group-hover:translate-x-0.5" />
                </a>

                <Typewriter
                    text={siteConfig.title}
                    className="max-w-5xl text-[1.75rem] xs:text-4xl sm:text-5xl lg:text-6xl"
                />

                <p className="mt-6 max-w-2xl animate-fade-up font-pixel-sm text-base leading-relaxed text-pretty text-muted [animation-delay:150ms] sm:text-lg">
                    Create an app, copy its keys, and post scores with a single HTTP request. There&apos;s no
                    SDK to install and no server to run. It works from Godot, Unity, a web build or plain
                    curl.
                </p>

                <div className="mt-10 flex w-full animate-fade-up flex-col justify-center gap-3 [animation-delay:250ms] xs:w-auto xs:flex-row">
                    <ButtonLink href={signedIn ? '/console' : '/auth/sign-up'} size="lg">
                        {signedIn ? 'Go to console' : 'Create your first app'} <Icon icon={faArrowRight} />
                    </ButtonLink>
                    <ButtonLink href="/apps" variant="secondary" size="lg">
                        Browse apps
                    </ButtonLink>
                </div>
            </Container>

            <Container className="pt-16 pb-20 sm:pt-20 sm:pb-28">
                <div className="relative mx-auto grid max-w-5xl gap-5 text-left lg:grid-cols-12 lg:gap-0">
                    <div className="z-10 min-w-0 animate-fade-up [animation-delay:500ms] lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:mt-[22rem] lg:-mr-16">
                        <TerminalCard
                            title="submit-score.sh"
                            command={`curl -X POST "${origin}/api/leaderboard?appId=YOUR_APP_ID&name=Benjamin%20Thio&score=999" \\\n  -H "X-Api-Key: YOUR_WRITE_KEY"`}
                            response={[
                                'HTTP/1.1 201 Created',
                                'content-type: application/json',
                                'x-ratelimit-remaining: 59',
                            ]}
                        />
                    </div>
                    <div className="min-w-0 animate-fade-up [animation-delay:350ms] lg:col-span-8 lg:col-start-5 lg:row-start-1">
                        <TiltCard>
                            <EditorCard filename="response.json" code={EXAMPLE_RESPONSE} />
                        </TiltCard>
                    </div>
                </div>
            </Container>
        </section>
    );
}
