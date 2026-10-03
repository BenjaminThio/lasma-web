import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalList, LegalPage, LegalSection } from '@/components/layout/legal-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Privacy',
    description: `What ${siteConfig.name} stores about developers and players, why, and how to delete it.`,
};

export default function PrivacyPage() {
    return (
        <LegalPage
            eyebrow="privacy"
            title="Privacy"
            updated="17 September 2026"
            intro={
                <p>
                    {siteConfig.name} keeps the least it can: enough to run your account and your
                    leaderboards, and nothing for advertising. There are no trackers, analytics scripts or
                    third-party cookies on this site.
                </p>
            }
        >
            <LegalSection title="If you have an account">
                <LegalList>
                    <li>
                        <strong className="text-white">Email and username</strong>, to log you in and show who
                        is signed in.
                    </li>
                    <li>
                        <strong className="text-white">Your password</strong>, stored only as a salted scrypt
                        hash. We can&apos;t read it.
                    </li>
                    <li>
                        <strong className="text-white">A profile picture</strong>, if you upload one. It is
                        re-encoded, which strips camera and location metadata.
                    </li>
                    <li>
                        <strong className="text-white">Sessions</strong>: when you signed in, when the session
                        expires, and your browser&apos;s user-agent string, so the account page can list where
                        you&apos;re signed in.
                    </li>
                    <li>
                        <strong className="text-white">Your Google account ID</strong>, if you connect Google.
                        We don&apos;t receive your Google password or contacts.
                    </li>
                    <li>
                        <strong className="text-white">Your apps</strong>: names, descriptions, thumbnails,
                        settings, and a hash of each write key.
                    </li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Players in your games">
                <p>
                    Leaderboards hold what your game sends: a player name, a score, a generated player ID and
                    the time of the last update. Public boards can be read by anyone with the App ID. If
                    you&apos;re a player and want an entry removed, ask the game&apos;s developer: owners can
                    remove any row from their leaderboard page.
                </p>
            </LegalSection>

            <LegalSection title="Cookies">
                <p>Only cookies needed for the site to work:</p>
                <LegalList>
                    <li>
                        A session cookie while you&apos;re logged in (one day, or 30 days with &ldquo;remember
                        me&rdquo;). It holds a random token; we store only its hash.
                    </li>
                    <li>
                        A short-lived cookie during &ldquo;Sign in with Google&rdquo; that protects the login
                        from forgery.
                    </li>
                </LegalList>
            </LegalSection>

            <LegalSection title="IP addresses">
                <p>
                    Requests are counted per IP address for a few minutes to enforce rate limits and stop
                    abuse. Those counters expire on their own and aren&apos;t linked to your account. Hosting
                    providers may keep standard access logs.
                </p>
            </LegalSection>

            <LegalSection title="Services we rely on">
                <LegalList>
                    <li>Google Cloud Firestore, where accounts, apps and leaderboards are stored.</li>
                    <li>An email provider (Resend) to deliver password reset links.</li>
                    <li>Google, only if you choose to sign in with it.</li>
                    <li>The hosting provider that serves this website.</li>
                </LegalList>
                <p>None of them receive your data for their own marketing.</p>
            </LegalSection>

            <LegalSection title="Keeping or deleting your data">
                <p>
                    You can change your details, sign out other devices, or delete your account from the{' '}
                    <Link
                        href="/account"
                        className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                        account page
                    </Link>
                    . Deleting your account immediately removes your profile, sessions, apps and every
                    leaderboard in them. Password reset links expire after 30 minutes and sessions when they
                    end.
                </p>
            </LegalSection>

            <LegalSection title="Changes">
                <p>If this page changes in a way that matters, the date at the top changes with it.</p>
            </LegalSection>
        </LegalPage>
    );
}
