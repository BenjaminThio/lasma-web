import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';
import { ShowcaseHeader } from '@/components/showcase/showcase-header';
import { SwitchDemo } from '@/components/showcase/switch-demo';

export const metadata: Metadata = {
    title: '<Switch/>',
    description: 'An accessible toggle that slides or snaps.',
};

export default function SwitchPage() {
    return (
        <PageTransition>
            <div className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-10 px-4 py-10">
                <ShowcaseHeader title="<Switch/>">
                    A checkbox in disguise: keyboard and screen-reader friendly.
                </ShowcaseHeader>
                <SwitchDemo />
            </div>
        </PageTransition>
    );
}
