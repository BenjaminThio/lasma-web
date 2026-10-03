'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
    faArrowRightFromBracket,
    faDesktop,
    faMobileScreen,
    faSignal,
    faTabletScreenButton,
} from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import type { ActiveSession, DeviceKind } from '@/lib/domain';
import { formatDate, pluralize } from '@/lib/format';
import { revokeOtherSessionsAction, revokeSessionAction } from '@/server/actions/account';
import { AccountSection } from './section';

const DEVICE_ICONS: Record<DeviceKind, typeof faDesktop> = {
    desktop: faDesktop,
    mobile: faMobileScreen,
    tablet: faTabletScreenButton,
    other: faSignal,
};

function SessionRow({ session }: { session: ActiveSession }) {
    const [pending, startTransition] = useTransition();

    function revoke() {
        startTransition(async () => {
            const result = await revokeSessionAction(session.id);
            if (result.ok) toast.success('That device has been signed out.');
            else toast.error(result.error);
        });
    }

    return (
        <li className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-canvas px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-raised text-lg text-muted">
                <Icon icon={DEVICE_ICONS[session.device]} />
            </span>
            <div className="min-w-0 grow basis-48">
                <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate">
                        {session.browser} on {session.os}
                    </span>
                    {session.current ? (
                        <span className="rounded-full bg-ready/15 px-2 py-0.5 font-pixel-sm text-xs text-ready">
                            This device
                        </span>
                    ) : null}
                </p>
                <p className="font-pixel-sm text-xs text-subtle">
                    Signed in {formatDate(session.createdAt)} · expires {formatDate(session.expiresAt)}
                </p>
            </div>
            {session.current ? null : (
                <Button variant="ghost" size="sm" onClick={revoke} disabled={pending} aria-busy={pending}>
                    <Icon icon={faArrowRightFromBracket} /> {pending ? 'Signing out…' : 'Sign out'}
                </Button>
            )}
        </li>
    );
}

export function SessionsSection({ sessions }: { sessions: ActiveSession[] }) {
    const [pending, startTransition] = useTransition();
    const others = sessions.filter((session) => !session.current).length;

    function revokeOthers() {
        startTransition(async () => {
            const result = await revokeOtherSessionsAction();
            if (result.ok) toast.success(`Signed out ${pluralize(result.data, 'other session')}.`);
            else toast.error(result.error);
        });
    }

    return (
        <AccountSection
            id="sessions"
            icon={faSignal}
            title="Where you're signed in"
            description="Sign out anything you don't recognise. Sessions end on their own when they expire."
            action={
                others > 0 ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={revokeOthers}
                        disabled={pending}
                        aria-busy={pending}
                    >
                        {pending ? 'Signing out…' : 'Sign out everywhere else'}
                    </Button>
                ) : null
            }
        >
            <ul className="flex flex-col gap-2">
                {sessions.map((session) => (
                    <SessionRow key={session.id} session={session} />
                ))}
            </ul>
        </AccountSection>
    );
}
