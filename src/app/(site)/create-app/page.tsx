import type { Metadata } from 'next';
import { AppEditor } from '@/components/apps/app-editor';
import { PageTransition } from '@/components/layout/page-transition';
import { requireUser } from '@/server/auth/current-user';

export const metadata: Metadata = {
    title: 'Create app',
    robots: { index: false, follow: false },
};

export default async function CreateAppPage() {
    await requireUser('/create-app');

    return (
        <PageTransition>
            <AppEditor />
        </PageTransition>
    );
}
