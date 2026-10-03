import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { SignUpForm } from '@/components/auth/auth-forms';
import { PageTransition } from '@/components/layout/page-transition';
import { getCurrentUser } from '@/server/auth/current-user';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create a LASMA account and add a leaderboard to your game.',
};

export default async function SignUpPage() {
    if (await getCurrentUser()) redirect('/console');

    return (
        <PageTransition>
            <AuthCard title="Sign Up" subtitle="Free for indie games. Your first board takes a minute.">
                <SignUpForm />
            </AuthCard>
        </PageTransition>
    );
}
