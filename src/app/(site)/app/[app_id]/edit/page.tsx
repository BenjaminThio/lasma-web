import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppEditor } from '@/components/apps/app-editor';
import { PageTransition } from '@/components/layout/page-transition';
import { requireUser } from '@/server/auth/current-user';
import { getEditableApp } from '@/server/services/apps';

export const metadata: Metadata = {
    title: 'Edit app',
    robots: { index: false, follow: false },
};

export default async function EditAppPage({ params }: PageProps<'/app/[app_id]/edit'>) {
    const { app_id: appId } = await params;
    const app = await getEditableApp(requireUser(`/app/${appId}/edit`), appId);

    // Other people's apps look exactly like missing ones.
    if (!app) notFound();

    return (
        <PageTransition>
            <AppEditor app={app} />
        </PageTransition>
    );
}
