import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';
import { Fan } from '@/components/showcase/fan';

export const metadata: Metadata = {
    title: 'Pop Yi Fan',
    description: 'Tap the fan. Hear the pop. That is the whole game.',
};

export default function PopYiFanPage() {
    return (
        <PageTransition>
            <div className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10 font-mars">
                <h1 className="animate-pop-in text-4xl sm:text-5xl">POP YI FAN</h1>
                <Fan />
            </div>
        </PageTransition>
    );
}
