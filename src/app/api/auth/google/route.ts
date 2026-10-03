import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth/current-user';
import { beginGoogleFlow, isGoogleEnabled } from '@/server/auth/google';
import { consume, RATE_LIMITS } from '@/server/security/rate-limit';
import { clientIpFrom, safeRedirectPath } from '@/server/security/request';

/** Starts "Sign in with Google" (`?intent=login`) or connects Google to the signed-in account (`?intent=link`). */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const intent = params.get('intent') === 'link' ? 'link' : 'login';
    const failure = intent === 'link' ? '/account?flash=' : '/auth/login?flash=';

    if (!isGoogleEnabled()) redirect(`${failure}google_unavailable` as Route);

    const limit = await consume(`oauth:ip:${clientIpFrom(request.headers)}`, RATE_LIMITS.oauthPerIp);
    if (!limit.ok) redirect(`${failure}rate_limited` as Route);

    if (intent === 'link' && !(await getCurrentUser())) redirect('/auth/login?next=/account' as Route);

    const next = safeRedirectPath(params.get('next'), intent === 'link' ? '/account' : '/console');
    redirect((await beginGoogleFlow(intent, next)) as Route);
}
