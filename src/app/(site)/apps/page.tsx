import type { Metadata } from 'next';
import { AppGallery } from '@/components/apps/app-gallery';
import { PageTransition } from '@/components/layout/page-transition';
import { Container } from '@/components/ui/primitives';
import { PAGE_SIZE } from '@/lib/constants';
import { listPublicApps } from '@/server/services/apps';

export const metadata: Metadata = {
    title: 'Apps',
    description: 'Public games with LASMA leaderboards. Pick one to see who is on top.',
};

export default async function AppsPage() {
    const initialPage = await listPublicApps(null, PAGE_SIZE.gallery);

    return (
        <PageTransition>
            <Container className="py-10 sm:py-14">
                <header className="mb-8 flex flex-col gap-2 sm:mb-10">
                    <h1 className="text-3xl font-bold sm:text-4xl">Apps</h1>
                    <p className="font-pixel-sm text-muted sm:text-lg">
                        Public games with LASMA leaderboards. Pick one to see who is on top.
                    </p>
                </header>
                <AppGallery initialPage={initialPage} />
            </Container>
        </PageTransition>
    );
}
