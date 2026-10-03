import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalList, LegalPage, LegalSection } from '@/components/layout/legal-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Terms',
    description: `The rules for using ${siteConfig.name} and its leaderboard API.`,
};

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="terms"
            title="Terms of use"
            updated="17 September 2026"
            intro={
                <p>
                    {siteConfig.name} is a small, independent service for game developers. By creating an
                    account or calling the API you agree to these terms. They&apos;re short on purpose.
                </p>
            }
        >
            <LegalSection title="Your account">
                <LegalList>
                    <li>
                        Keep your password and write keys private. You&apos;re responsible for what is done
                        with them.
                    </li>
                    <li>
                        If a write key leaks, generate a new one from the app&apos;s edit page straight away.
                    </li>
                    <li>One person per account. Don&apos;t create accounts to get around limits or bans.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="What you can't do">
                <LegalList>
                    <li>
                        Use app names, descriptions, images or player names that are illegal, hateful, sexual
                        or harassing.
                    </li>
                    <li>Store personal data about players beyond a display name and a score.</li>
                    <li>
                        Try to break, overload or get around the service: probing other people&apos;s apps,
                        scraping at volume, or evading rate limits.
                    </li>
                    <li>Use the API for anything other than game leaderboards and similar scoreboards.</li>
                </LegalList>
                <p>
                    Apps or accounts that break these rules may be disabled or removed, with or without
                    notice.
                </p>
            </LegalSection>

            <LegalSection title="Your content">
                <p>
                    You keep the rights to what you upload. You let {siteConfig.name} store and display it so
                    the service works, including showing public apps in the{' '}
                    <Link
                        href="/apps"
                        className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                        gallery
                    </Link>
                    . Make an app private or delete it at any time.
                </p>
            </LegalSection>

            <LegalSection title="Availability">
                <p>
                    The service is provided as is. We work to keep it fast and online, but can&apos;t promise
                    it will never go down, lose data or change. Keep your own copy of anything you can&apos;t
                    afford to lose, and have your game handle a failed request gracefully.
                </p>
                <p>
                    Limits (request rates, sizes, page sizes) may change to protect the service; the API docs
                    list the current ones.
                </p>
            </LegalSection>

            <LegalSection title="Ending things">
                <p>
                    You can delete your account whenever you like from the{' '}
                    <Link
                        href="/account"
                        className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                        account page
                    </Link>
                    . We may close accounts that break these terms or stay unused for a long time.
                </p>
            </LegalSection>

            <LegalSection title="Liability">
                <p>
                    To the extent the law allows, {siteConfig.name} and {siteConfig.author} aren&apos;t liable
                    for indirect losses or lost data arising from use of the service. See also the{' '}
                    <Link
                        href="/privacy"
                        className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                        privacy page
                    </Link>
                    .
                </p>
            </LegalSection>
        </LegalPage>
    );
}
