import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/auth-forms';
import { PageTransition } from '@/components/layout/page-transition';
import { features, isProduction } from '@/server/env';

export const metadata: Metadata = {
    title: 'Forgot password',
    description: 'Get a link to reset your LASMA password.',
    robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
    return (
        <PageTransition>
            <AuthCard title="Forgot password" subtitle="Enter your email and we'll send you a reset link.">
                {/* Only production needs the warning: development logs the link on purpose. */}
                <ForgotPasswordForm emailConfigured={features.email || !isProduction} />
            </AuthCard>
        </PageTransition>
    );
}
