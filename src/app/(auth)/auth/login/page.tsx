import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/auth-forms';
import { PageTransition } from '@/components/layout/page-transition';
import { getCurrentUser } from '@/server/auth/current-user';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Log in to manage your LASMA apps and leaderboards.',
};

export default async function LoginPage({ searchParams }: PageProps<'/auth/login'>) {
    if (await getCurrentUser()) redirect('/console');

    const { next } = await searchParams;

    return (
        <PageTransition>
            <AuthCard title="Login" subtitle="Welcome back. Your boards missed you.">
                <LoginForm next={typeof next === 'string' ? next : undefined} />
            </AuthCard>
        </PageTransition>
    );
}
