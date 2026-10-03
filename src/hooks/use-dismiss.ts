'use client';

import { useEffect, useEffectEvent, type RefObject } from 'react';

/**
 * Closes a popover (menu, dropdown, panel) when the user clicks or taps outside of it, or presses
 * Escape. Clicks inside any of `refs` — typically the panel and its trigger — are ignored.
 *
 * Pair it with route-derived state (see `useRouteScopedState`) so panels also close on navigation.
 */
export function useDismiss(
    open: boolean,
    onDismiss: () => void,
    refs: ReadonlyArray<RefObject<HTMLElement | null>>,
): void {
    const dismiss = useEffectEvent(onDismiss);
    const isInside = useEffectEvent((target: Node) => refs.some((ref) => ref.current?.contains(target)));

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (event.target instanceof Node && !isInside(event.target)) dismiss();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') dismiss();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);
}
