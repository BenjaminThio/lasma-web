'use client';

import Link from 'next/link';
import { Suspense, use, useRef } from 'react';
import { Icon } from '@/components/ui/icon';
import { faAtom, faBars, faXmark } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/primitives';
import { useDismiss } from '@/hooks/use-dismiss';
import { useRouteScopedState } from '@/hooks/use-route-scoped-state';
import { cn } from '@/lib/cn';
import type { SessionUser } from '@/lib/domain';
import { AccountMenu } from './account-menu';
import { ComponentsMenu } from './components-menu';
import { MobileMenu } from './mobile-menu';
import { NavLink } from './nav-link';

type Panel = 'components' | 'account' | 'mobile';

interface NavbarProps {
    /** Resolved lazily so the navbar paints immediately and the account area streams in. */
    userPromise: Promise<SessionUser | null>;
}

function DesktopAccount({
    userPromise,
    open,
    onToggle,
    onClose,
}: {
    userPromise: Promise<SessionUser | null>;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    const user = use(userPromise);

    if (!user) {
        return (
            <>
                <NavLink href="/auth/sign-up">Sign up</NavLink>
                <NavLink href="/auth/login">Login</NavLink>
            </>
        );
    }

    return (
        <>
            <NavLink href="/console">Go to console</NavLink>
            <AccountMenu user={user} open={open} onToggle={onToggle} onClose={onClose} />
        </>
    );
}

export function Navbar({ userPromise }: NavbarProps) {
    // Route-scoped: every panel closes by itself when the page changes.
    const [panel, setPanel] = useRouteScopedState<Panel>();
    const close = () => setPanel(null);
    const toggle = (next: Panel) => setPanel(panel === next ? null : next);

    const componentsTriggerRef = useRef<HTMLButtonElement>(null);
    const componentsPanelRef = useRef<HTMLDivElement>(null);
    const mobileTriggerRef = useRef<HTMLButtonElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);

    useDismiss(panel === 'components', close, [componentsTriggerRef, componentsPanelRef]);
    useDismiss(panel === 'mobile', close, [mobileTriggerRef, mobilePanelRef]);

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <nav
                aria-label="Main"
                className="relative z-20 flex h-14 items-center justify-between gap-4 bg-raised px-4 text-lg shadow-nav [view-transition-name:site-header] sm:px-6"
            >
                <Link
                    href="/"
                    className="flex items-center font-bold whitespace-nowrap"
                    aria-label="LASMA Studio home"
                >
                    <Icon icon={faAtom} fixedWidth className="animate-atom" />
                    <span>&nbsp;LASMA STUDIO</span>
                </Link>

                <button
                    ref={componentsTriggerRef}
                    type="button"
                    aria-expanded={panel === 'components'}
                    aria-controls="components-menu"
                    onClick={() => toggle('components')}
                    className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 transition-colors hover:text-accent md:flex"
                >
                    Components
                    <span
                        aria-hidden
                        className={cn(
                            'size-0 border-x-[0.7ch] border-t-[0.7ch] border-x-transparent border-t-current transition-transform duration-200',
                            panel === 'components' && '-rotate-180',
                        )}
                    />
                </button>

                <div className="hidden h-full items-center gap-6 md:flex">
                    <NavLink href="/apps">Apps</NavLink>
                    <NavLink href="/docs">Docs</NavLink>
                    <Suspense fallback={<Skeleton className="h-6 w-44" />}>
                        <DesktopAccount
                            userPromise={userPromise}
                            open={panel === 'account'}
                            onToggle={() => toggle('account')}
                            onClose={close}
                        />
                    </Suspense>
                </div>

                <button
                    ref={mobileTriggerRef}
                    type="button"
                    aria-label={panel === 'mobile' ? 'Close menu' : 'Open menu'}
                    aria-expanded={panel === 'mobile'}
                    aria-controls="mobile-menu"
                    onClick={() => toggle('mobile')}
                    className="-mr-2 grid size-10 place-items-center rounded-lg text-xl transition-colors hover:bg-white/8 md:hidden"
                >
                    <Icon icon={panel === 'mobile' ? faXmark : faBars} fixedWidth />
                </button>
            </nav>

            <ComponentsMenu
                id="components-menu"
                open={panel === 'components'}
                panelRef={componentsPanelRef}
                onNavigate={close}
            />
            <MobileMenu
                id="mobile-menu"
                open={panel === 'mobile'}
                panelRef={mobilePanelRef}
                userPromise={userPromise}
                onNavigate={close}
            />
        </header>
    );
}
