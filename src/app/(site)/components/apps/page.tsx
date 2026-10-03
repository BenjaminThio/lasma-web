import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';
import { ColorTable, type ColorGroup } from '@/components/showcase/color-table';
import { Monitor } from '@/components/showcase/monitor';
import { formatHsl, formatRgb, rgbToHex, rgbToHsl } from '@/lib/color';
import { COLOR_KEYWORDS } from '@/lib/color-keywords';
import { camelToTitle } from '@/lib/format';

export const metadata: Metadata = {
    title: '<Lightbulb/>',
    description: 'A glowing light-bulb component with a live colour lab and a CSS colour keyword reference.',
};

// Formatted on the server so the browser only receives ready-to-render strings.
const COLOR_GROUPS: ColorGroup[] = Object.entries(COLOR_KEYWORDS).map(([group, colors]) => ({
    title: camelToTitle(group),
    rows: Object.entries(colors).map(([keyword, rgb]) => ({
        keyword,
        rgb: formatRgb(rgb),
        hex: rgbToHex(rgb),
        hsl: formatHsl(rgbToHsl(rgb)),
    })),
}));

export default function LightbulbPage() {
    return (
        <PageTransition>
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-2">
                <section aria-label="Colour keywords" className="min-w-0 px-4 py-8 sm:px-8">
                    <ColorTable groups={COLOR_GROUPS} />
                </section>
                <section
                    aria-label="Light bulb editor"
                    className="flex flex-col items-center border-b border-white/15 bg-canvas px-4 py-10 lg:sticky lg:top-14 lg:h-[calc(100svh-3.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-l lg:border-white lg:py-6"
                >
                    {/* Auto margins centre it while it fits, and it scrolls from the top when it doesn't. */}
                    <div className="my-auto flex w-full justify-center">
                        <Monitor />
                    </div>
                </section>
            </div>
        </PageTransition>
    );
}
