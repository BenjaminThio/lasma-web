'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    className?: string;
}

/**
 * Modal built on the native <dialog>: focus trapping, Escape-to-close and the backdrop come from
 * the browser. Clicking the backdrop closes it too.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className={cn(
                'm-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border-3 border-canvas bg-surface p-0 text-white shadow-float',
                'backdrop:bg-black/65 backdrop:backdrop-blur-[2px] open:animate-panel-in',
                className,
            )}
        >
            <div className="flex flex-col gap-3 p-5 sm:p-6">
                <h2 id={titleId} className="text-xl leading-tight font-bold">
                    {title}
                </h2>
                {description ? (
                    <div className="font-pixel-sm text-sm leading-relaxed text-muted">{description}</div>
                ) : null}
                {children}
                {footer ? <div className="mt-3 flex flex-wrap justify-end gap-2">{footer}</div> : null}
            </div>
        </dialog>
    );
}
