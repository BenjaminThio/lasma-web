import { PageTransition } from '@/components/layout/page-transition';
import { ApiReference } from '@/components/landing/api-reference';
import { CallToAction, EnginesStrip, Faq, Showcase } from '@/components/landing/closing-sections';
import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { getCurrentUserSafely } from '@/server/auth/current-user';
import { getRequestOrigin } from '@/server/http/base-url';

export default async function HomePage() {
    const [user, origin] = await Promise.all([getCurrentUserSafely(), getRequestOrigin()]);
    const signedIn = user !== null;

    return (
        <PageTransition>
            <Hero signedIn={signedIn} origin={origin} />
            <EnginesStrip />
            <HowItWorks />
            <Features />
            <ApiReference origin={origin} />
            <Showcase />
            <Faq />
            <CallToAction signedIn={signedIn} />
        </PageTransition>
    );
}
