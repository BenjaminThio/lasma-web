import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';

export const metadata: Metadata = {
    title: 'Test',
    robots: { index: false, follow: false },
};

/** Scratch page kept from the original project. */
export default function TestPage() {
    return (
        <PageTransition>
            <div className="min-h-[calc(100svh-3.5rem)] bg-highlight p-4 text-canvas">page</div>
        </PageTransition>
    );
}
