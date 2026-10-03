'use client';

import { useRef, type PointerEvent } from 'react';

/** Tailwind classes that turn the variables written by `useTilt` into a 3D tilt (skipped for reduced motion). */
export const TILT_TRANSFORM_CLASSES =
    'motion-safe:[transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]';

/**
 * A mouse-following tilt without re-renders: pointer moves write `--rx`/`--ry` (degrees), `--gx`/`--gy`
 * (pointer position, for a glare) and `--glare` (0 or 1) straight onto the element, at most once per
 * frame. Touch and pen input are ignored so scrolling on phones never wobbles the element.
 */
export function useTilt<T extends HTMLElement>(maxDegrees: number) {
    const ref = useRef<T>(null);
    const frame = useRef(0);

    function onPointerMove(event: PointerEvent<T>) {
        if (event.pointerType !== 'mouse') return;

        const { clientX, clientY } = event;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const element = ref.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const x = (clientX - rect.left) / rect.width;
            const y = (clientY - rect.top) / rect.height;

            element.style.setProperty('--ry', `${((x - 0.5) * 2 * maxDegrees).toFixed(2)}deg`);
            element.style.setProperty('--rx', `${((0.5 - y) * 2 * maxDegrees).toFixed(2)}deg`);
            element.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
            element.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
            element.style.setProperty('--glare', '1');
        });
    }

    function onPointerLeave() {
        cancelAnimationFrame(frame.current);
        const element = ref.current;
        if (!element) return;

        element.style.setProperty('--rx', '0deg');
        element.style.setProperty('--ry', '0deg');
        element.style.setProperty('--glare', '0');
    }

    return { ref, onPointerMove, onPointerLeave };
}
