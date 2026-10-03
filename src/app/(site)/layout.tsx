import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <main id="main" className="min-h-svh pt-14">
                {children}
            </main>
            <Footer />
        </>
    );
}
