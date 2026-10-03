import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/auth-forms';
import { PageTransition } from '@/components/layout/page-transition';
import { ButtonLink } from '@/components/ui/button';
import { isResetTokenValid } from '@/server/services/password-reset';
import { resetTokenSchema } from '@/server/validation';

export const metadata: Metadata = {
    title: 'Reset password',
    robots: { index: false, follow: false },
    // The token is in the URL: never send it to another site as a referrer.
    referrer: 'no-referrer',
};

export default async function ResetPasswordPage({ searchParams }: PageProps<'/auth/reset-password'>) {
    const { token } = await searchParams;
    const parsed = resetTokenSchema.safeParse(token);
    const valid = parsed.success && (await isResetTokenValid(parsed.data));

    return (
        <PageTransition>
            {valid ? (
                <AuthCard title="New password" subtitle="Choose a password you don't use anywhere else.">
                    <ResetPasswordForm token={parsed.data} />
                </AuthCard>
            ) : (
                <AuthCard title="Link expired" subtitle="Reset links work once and only for 30 minutes.">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-center font-pixel-sm text-muted">
                            This link has expired or was already used. Ask for a new one and use the newest
                            email.
                        </p>
                        <ButtonLink href="/auth/forgot-password" size="lg" className="w-full">
                            Send a new link
                        </ButtonLink>
                        <ButtonLink href="/auth/login" variant="ghost" className="w-full">
                            Back to login
                        </ButtonLink>
                    </div>
                </AuthCard>
            )}
        </PageTransition>
    );
}
