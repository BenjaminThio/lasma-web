import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DangerZone } from '@/components/account/danger-zone';
import { ProfileSection } from '@/components/account/profile-section';
import { ConnectionsSection, EmailSection, PasswordSection } from '@/components/account/security-sections';
import { SessionsSection } from '@/components/account/sessions-section';
import { PageTransition } from '@/components/layout/page-transition';
import { Avatar } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faPlus, faTerminal } from '@/components/ui/icons';
import { Container } from '@/components/ui/primitives';
import { formatDate, pluralize } from '@/lib/format';
import { loginPath, requireUser } from '@/server/auth/current-user';
import { readSession } from '@/server/auth/session';
import { features } from '@/server/env';
import { getAccountOverview, listSessions } from '@/server/services/accounts';
import { countOwnedApps } from '@/server/services/apps';

export const metadata: Metadata = {
    title: 'Account',
    robots: { index: false, follow: false },
};

const SECTIONS = [
    { id: 'profile', label: 'Profile' },
    { id: 'email', label: 'Email' },
    { id: 'password', label: 'Password' },
    { id: 'connections', label: 'Sign-in methods' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'danger', label: 'Delete account' },
];

export default async function AccountPage() {
    const user = await requireUser('/account');
    const session = await readSession();

    const [account, sessions, appCount] = await Promise.all([
        getAccountOverview(user.email),
        session ? listSessions(user.email, session.id) : [],
        countOwnedApps(user),
    ]);

    if (!account || !session) redirect(loginPath('/account'));

    return (
        <PageTransition>
            <Container className="max-w-6xl py-10 sm:py-14">
                <header className="flex animate-fade-up flex-col gap-6 rounded-2xl border border-white/[0.06] bg-surface bg-dot-grid p-5 sm:flex-row sm:items-center sm:p-8">
                    <Avatar src={account.avatarUrl} size={96} priority className="size-20 sm:size-24" />
                    <div className="min-w-0 grow">
                        <p className="font-pixel-sm text-sm tracking-widest text-accent uppercase">
                            {'// account'}
                        </p>
                        <h1 className="mt-1 truncate text-3xl font-bold sm:text-4xl" title={account.username}>
                            {account.username}
                        </h1>
                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-pixel-sm text-sm text-muted">
                            <span className="truncate">{account.email}</span>
                            <span aria-hidden>·</span>
                            <span>
                                {account.createdAt > 0
                                    ? `Member since ${formatDate(account.createdAt)}`
                                    : 'Member'}
                            </span>
                            <span aria-hidden>·</span>
                            <span>{pluralize(appCount, 'app')}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ButtonLink href="/console" variant="secondary" size="sm">
                            <Icon icon={faTerminal} /> Console
                        </ButtonLink>
                        <ButtonLink href="/create-app" size="sm">
                            <Icon icon={faPlus} /> New app
                        </ButtonLink>
                    </div>
                </header>

                <div className="mt-8 grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
                    <nav aria-label="Account sections" className="hidden lg:block">
                        <ul className="sticky top-20 flex flex-col gap-1 font-pixel-sm">
                            {SECTIONS.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="block rounded-lg px-3 py-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
                                    >
                                        {section.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex min-w-0 flex-col gap-6">
                        <ProfileSection account={account} />
                        <EmailSection account={account} />
                        <PasswordSection account={account} />
                        <ConnectionsSection account={account} googleAvailable={features.google} />
                        <SessionsSection sessions={sessions} />
                        <DangerZone account={account} appCount={appCount} />
                    </div>
                </div>
            </Container>
        </PageTransition>
    );
}
