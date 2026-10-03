import type { Metadata } from 'next';
import { ConsoleApps } from '@/components/console/console-apps';
import { PageTransition } from '@/components/layout/page-transition';
import { Container } from '@/components/ui/primitives';
import { PAGE_SIZE } from '@/lib/constants';
import { requireUser } from '@/server/auth/current-user';
import { countOwnedApps, listOwnedApps } from '@/server/services/apps';

export const metadata: Metadata = {
    title: 'Console',
    robots: { index: false, follow: false },
};

export default async function ConsolePage() {
    const user = await requireUser('/console');
    const [initialPage, total] = await Promise.all([
        listOwnedApps(user, null, PAGE_SIZE.console),
        countOwnedApps(user),
    ]);

    return (
        <PageTransition>
            <Container className="max-w-7xl py-10 sm:py-14">
                <ConsoleApps initialPage={initialPage} total={total} />
            </Container>
        </PageTransition>
    );
}
