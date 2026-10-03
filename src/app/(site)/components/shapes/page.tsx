import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { PageTransition } from '@/components/layout/page-transition';
import { ShowcaseHeader } from '@/components/showcase/showcase-header';

export const metadata: Metadata = {
    title: '<Shapes/>',
    description: 'A triangle, an arrow and a circle drawn with nothing but CSS borders.',
};

function Shape({ label, children, index }: { label: string; children: ReactNode; index: number }) {
    return (
        <figure
            className="flex animate-pop-in flex-col items-center gap-6 stagger"
            style={{ '--i': index } as CSSProperties}
        >
            <div className="grid size-40 place-items-center">{children}</div>
            <figcaption className="w-fit rounded-xl bg-raised px-2 py-2 text-lg">{label}</figcaption>
        </figure>
    );
}

export default function ShapesPage() {
    return (
        <PageTransition>
            <div className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center gap-12 px-4 py-10 sm:py-14">
                <ShowcaseHeader title="<Shapes/>">
                    Pure CSS shapes built from borders and radii.
                </ShowcaseHeader>
                <div className="grid w-full max-w-4xl grid-cols-1 justify-items-center gap-12 sm:grid-cols-3">
                    <Shape label="TRIANGLE" index={0}>
                        <div className="size-0 border-x-[5rem] border-b-[5rem] border-x-transparent border-b-white" />
                    </Shape>
                    <Shape label="ARROW" index={1}>
                        <div className="size-0 -rotate-45 [border-width:1rem_1rem_0_0] [border-style:solid] border-white p-8" />
                    </Shape>
                    <Shape label="CIRCLE" index={2}>
                        <div className="size-28 rounded-full bg-white" />
                    </Shape>
                </div>
            </div>
        </PageTransition>
    );
}
