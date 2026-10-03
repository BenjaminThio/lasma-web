import type { ReactNode } from 'react';
import { PageTransition } from '@/components/layout/page-transition';
import { Container } from '@/components/ui/primitives';

interface LegalPageProps {
    eyebrow: string;
    title: string;
    updated: string;
    intro: ReactNode;
    children: ReactNode;
}

/** Long-form text pages (privacy, terms): readable measure, generous spacing, the site's fonts. */
export function LegalPage({ eyebrow, title, updated, intro, children }: LegalPageProps) {
    return (
        <PageTransition>
            <Container className="max-w-3xl py-14 sm:py-20">
                <p className="animate-fade-up font-pixel-sm text-sm tracking-widest text-accent uppercase">{`// ${eyebrow}`}</p>
                <h1 className="mt-4 animate-fade-up text-4xl leading-tight font-bold sm:text-5xl">{title}</h1>
                <p className="mt-3 animate-fade-up font-pixel-sm text-sm text-subtle">
                    Last updated {updated}
                </p>
                <div className="mt-6 animate-fade-up font-pixel-sm text-lg leading-relaxed text-muted [animation-delay:100ms]">
                    {intro}
                </div>
                <div className="legal mt-12 flex flex-col gap-10 font-pixel-sm text-base leading-relaxed text-muted">
                    {children}
                </div>
            </Container>
        </PageTransition>
    );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 border-t border-white/5 pt-8">
            <h2 className="font-pixel text-2xl text-white">{title}</h2>
            {children}
        </section>
    );
}

export function LegalList({ children }: { children: ReactNode }) {
    return <ul className="flex list-outside list-disc flex-col gap-2 pl-5 marker:text-accent">{children}</ul>;
}
