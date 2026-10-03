'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/toast';

type Tone = keyof typeof toast;

/** One-off messages carried across a redirect as `?flash=<code>`. Unknown codes are ignored. */
const MESSAGES: Record<string, [Tone, string]> = {
    password_reset: ['success', "Password updated. You're signed in, and every other device was signed out."],
    account_deleted: ['info', 'Your account, apps and leaderboards have been deleted.'],
    google_linked: ['success', 'Google is connected. You can use it to log in from now on.'],
    google_cancelled: ['info', 'Google sign-in was cancelled.'],
    google_unavailable: ['error', "Google sign-in isn't available on this server yet."],
    google_state: ['error', 'That sign-in attempt expired. Please try again.'],
    google_failed: ['error', "Google sign-in didn't work. Please try again."],
    google_unverified: ['error', 'Verify your email with Google first, then try again.'],
    google_in_use: ['error', 'That Google account is already connected to a different LASMA account.'],
    google_email_exists: [
        'error',
        'An account already uses that email. Log in with your password, then connect Google from your account page.',
    ],
    rate_limited: ['error', 'Too many attempts. Wait a few minutes and try again.'],
};

export function Flash() {
    const code = useSearchParams().get('flash');
    const shown = useRef<string | null>(null);

    useEffect(() => {
        if (!code || shown.current === code) return;
        shown.current = code;

        const message = MESSAGES[code];
        if (message) toast[message[0]](message[1]);

        // Drop the parameter so a reload or a shared link doesn't repeat the message.
        const url = new URL(window.location.href);
        url.searchParams.delete('flash');
        window.history.replaceState(window.history.state, '', url);
    }, [code]);

    return null;
}
