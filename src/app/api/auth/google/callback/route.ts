import type { Route } from 'next';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth/current-user';
import { completeGoogleFlow, GoogleFlowError, takeGoogleFlow } from '@/server/auth/google';
import { startSession } from '@/server/auth/session';
import { logger } from '@/server/logger';
import { signInWithGoogle } from '@/server/services/accounts';

/** Google redirects here after the consent screen. Always answers with a redirect. */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const flow = await takeGoogleFlow();
    const failurePage = flow?.intent === 'link' ? '/account' : '/auth/login';

    let destination: string;

    try {
        if (!flow) throw new GoogleFlowError('google_state');
        if (params.get('error')) {
            destination = `${failurePage}?flash=google_cancelled`;
        } else {
            const profile = await completeGoogleFlow(flow, params.get('state'), params.get('code'));
            const linkTo = flow.intent === 'link' ? ((await getCurrentUser())?.email ?? null) : null;

            if (flow.intent === 'link' && !linkTo) {
                destination = '/auth/login?next=/account';
            } else {
                const result = await signInWithGoogle(profile, linkTo);

                if (!result.ok) {
                    destination = `${failurePage}?flash=${result.reason}`;
                } else if (flow.intent === 'link') {
                    destination = '/account?flash=google_linked';
                } else {
                    await startSession(result.user, true);
                    destination = flow.next;
                }
            }
        }
    } catch (error) {
        unstable_rethrow(error);

        if (!(error instanceof GoogleFlowError)) logger.error('Google sign-in failed', { error });
        destination = `${failurePage}?flash=${error instanceof GoogleFlowError ? error.reason : 'google_failed'}`;
    }

    redirect(destination as Route);
}
