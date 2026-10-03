'use client';

import { useEffect } from 'react';

/**
 * Drives every `<Reveal>` on the site with one IntersectionObserver. Elements that start below the
 * fold are hidden and faded in when they scroll into view; everything else is left alone. New
 * elements (streamed content, client-side navigations) are picked up by a MutationObserver that
 * does at most one query per animation frame.
 */
export function RevealObserver() {
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const intersection = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    (entry.target as HTMLElement).dataset.reveal = 'shown';
                    intersection.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
        );

        let frame = 0;
        const arm = () => {
            frame = 0;
            const fold = window.innerHeight * 0.95;

            for (const element of document.querySelectorAll<HTMLElement>('[data-reveal=""]')) {
                if (element.getBoundingClientRect().top < fold) {
                    element.dataset.reveal = 'static';
                } else {
                    element.dataset.reveal = 'hidden';
                    intersection.observe(element);
                }
            }
        };

        arm();
        const mutations = new MutationObserver(() => {
            frame ||= requestAnimationFrame(arm);
        });
        mutations.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelAnimationFrame(frame);
            mutations.disconnect();
            intersection.disconnect();

            // Nothing will reveal these any more: hand them back unmarked, so the next observer (React
            // re-runs effects in development, for example) arms them again instead of leaving them invisible.
            for (const element of document.querySelectorAll<HTMLElement>('[data-reveal="hidden"]')) {
                element.dataset.reveal = '';
            }
        };
    }, []);

    return null;
}
