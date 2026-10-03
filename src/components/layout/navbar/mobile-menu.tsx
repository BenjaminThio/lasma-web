'use client';

import { Suspense, use, type Ref } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faArrowRight, faBookOpen, faGamepad, faLayerGroup, faUserGear } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/primitives';
import { COMPONENT_PAGES } from '@/config/navigation';
import { cn } from '@/lib/cn';
import type { SessionUser } from '@/lib/domain';
import { LogOutButton } from './log-out-button';
import { NavLink } from './nav-link';

interface MobileMenuProps {
    id: string;
    open: boolean;
    panelRef: Ref<HTMLDivElement>;
    userPromise: Promise<SessionUser | null>;
    onNavigate: () => void;
}

function MobileAccount({ userPromise, onNavigate }: Pick<MobileMenuProps, 'userPromise' | 'onNavigate'>) {
    const user = use(userPromise);

    if (!user) {
        return (
            <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/auth/sign-up" variant="secondary" onClick={onNavigate}>
                    Sign up
                </ButtonLink>
                <ButtonLink href="/auth/login" onClick={onNavigate}>
                    Login
                </ButtonLink>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <NavLink
                href="/account"
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-xl bg-raised p-3 transition-colors hover:bg-raised-hover"
            >
                <Avatar src={user.avatarUrl} size={44} className="size-11" />
                <span className="min-w-0 grow">
                    <span className="block truncate text-lg">{user.username}</span>
                    <span className="block truncate font-pixel-sm text-sm text-muted">{user.email}</span>
                </span>
                <Icon icon={faUserGear} className="text-muted" title="Account settings" />
            </NavLink>
            <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/console" onClick={onNavigate}>
                    Go to console
                </ButtonLink>
                <LogOutButton
                    formClassName="w-full"
                    className="h-11 w-full rounded-lg bg-raised px-4 transition-colors hover:bg-raised-hover disabled:opacity-60"
                />
            </div>
        </div>
    );
}

/** Small screens: the whole navigation in one sheet that slides down from the navbar. */
export function MobileMenu({ id, open, panelRef, userPromise, onNavigate }: MobileMenuProps) {
    return (
        <>
            <div
                aria-hidden
                className={cn(
                    'fixed inset-x-0 top-14 bottom-0 bg-black/60 transition-opacity duration-300 md:hidden',
                    open ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
            />
            <div className="pointer-events-none absolute inset-x-0 top-full z-10 overflow-hidden md:hidden">
                <div
                    ref={panelRef}
                    id={id}
                    inert={!open}
                    className={cn(
                        'pointer-events-auto max-h-[calc(100svh-3.5rem)] overflow-y-auto overscroll-contain rounded-b-2xl bg-surface px-4 pt-5 pb-6 shadow-float',
                        'transition-[translate,opacity] duration-300 ease-out-quint',
                        open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
                    )}
                >
                    <nav aria-label="Mobile" className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
                            <NavLink
                                href="/apps"
                                onClick={onNavigate}
                                className="flex items-center justify-between rounded-xl bg-raised px-4 py-3 text-xl"
                            >
                                <span className="flex items-center gap-3">
                                    <Icon icon={faGamepad} fixedWidth /> Apps
                                </span>
                                <Icon icon={faArrowRight} className="text-muted" />
                            </NavLink>
                            <NavLink
                                href="/docs"
                                onClick={onNavigate}
                                className="flex items-center justify-between rounded-xl bg-raised px-4 py-3 text-xl"
                            >
                                <span className="flex items-center gap-3">
                                    <Icon icon={faBookOpen} fixedWidth /> Docs
                                </span>
                                <Icon icon={faArrowRight} className="text-muted" />
                            </NavLink>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="flex items-center gap-2 px-1 font-pixel-sm text-sm tracking-widest text-accent uppercase">
                                <Icon icon={faLayerGroup} /> Components
                            </p>
                            <ul className="grid grid-cols-1 gap-1 xs:grid-cols-2">
                                {COMPONENT_PAGES.map((page) => (
                                    <li key={page.href}>
                                        <NavLink
                                            href={page.href}
                                            onClick={onNavigate}
                                            className="flex flex-col rounded-lg px-3 py-2 hover:bg-white/5"
                                        >
                                            <span className="text-lg">{page.label}</span>
                                            <span className="font-pixel-sm text-xs text-subtle">
                                                {page.description}
                                            </span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
                            <MobileAccount userPromise={userPromise} onNavigate={onNavigate} />
                        </Suspense>
                    </nav>
                </div>
            </div>
        </>
    );
}
