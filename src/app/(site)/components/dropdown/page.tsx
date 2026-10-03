import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';
import { DropdownDemo } from '@/components/showcase/dropdown-demo';
import { ShowcaseHeader } from '@/components/showcase/showcase-header';

export const metadata: Metadata = {
    title: '<Dropdown/>',
    description: 'Menus that slide out from behind their trigger, vertically or horizontally.',
};

export default function DropdownPage() {
    return (
        <PageTransition>
            <div className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center gap-10 px-4 py-10 sm:py-14">
                <ShowcaseHeader title="<Dropdown/>">
                    The browser&apos;s select next to ours. Click outside or press Escape to close.
                </ShowcaseHeader>
                <DropdownDemo />
            </div>
        </PageTransition>
    );
}
