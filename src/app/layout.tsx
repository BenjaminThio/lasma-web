import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Flash } from '@/components/layout/flash';
import { RevealObserver } from '@/components/layout/reveal-observer';
import { Navbar } from '@/components/layout/navbar/navbar';
import { Toaster } from '@/components/ui/toast';
import { siteConfig } from '@/config/site';
import { getCurrentUserSafely } from '@/server/auth/current-user';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: `${siteConfig.name} · ${siteConfig.title}`,
        template: `%s · ${siteConfig.shortName}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    openGraph: {
        type: 'website',
        siteName: siteConfig.name,
        title: siteConfig.title,
        description: siteConfig.description,
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.title,
        description: siteConfig.description,
    },
    formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
    themeColor: '#131314',
    colorScheme: 'dark',
};

/** Shown only when JavaScript is off: images would otherwise wait for hydration to fade in. */
const NO_SCRIPT_STYLES = '<style>[data-smart-image] img{opacity:1!important}</style>';

export default async function RootLayout({ children }: LayoutProps<'/'>) {
    // Every page carries a per-request CSP nonce (see proxy.ts), so pages render per request.
    await connection();
    const userPromise = getCurrentUserSafely();

    return (
        <html lang="en" className={fontVariables} data-scroll-behavior="smooth">
            <body>
                <a
                    href="#main"
                    className="sr-only rounded-lg bg-accent px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100"
                >
                    Skip to content
                </a>
                <Navbar userPromise={userPromise} />
                {children}
                <Toaster />
                <RevealObserver />
                <Suspense fallback={null}>
                    <Flash />
                </Suspense>
                <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />
            </body>
        </html>
    );
}
