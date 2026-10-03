'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { useDismiss } from '@/hooks/use-dismiss';
import { cn } from '@/lib/cn';
import { Icon } from './icon';
import { faCheck, faCircleInfo, faXmark } from './icons';

export interface InfoTipItem {
    label: ReactNode;
    /** Live state of a requirement: `true` met, `false` not met, `undefined` just a note. */
    met?: boolean;
}

interface InfoTipProps {
    /** What the tip is about, for screen readers ("Password requirements"). */
    label: string;
    title?: ReactNode;
    items: InfoTipItem[];
    /** Which way the bubble grows from the button. */
    align?: 'start' | 'end';
    className?: string;
}

/**
 * A small "i" button with a bubble listing a field's requirements. Opens on hover for mice, on
 * keyboard focus, and on tap for touch screens; closes on Escape, outside click, or pointer leave.
 */
export function InfoTip({ label, title, items, align = 'end', className }: InfoTipProps) {
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);
    const tipId = useId();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const open = hovered || pinned;
    const close = () => {
        setHovered(false);
        setPinned(false);
    };

    useDismiss(open, close, [wrapperRef]);

    return (
        <span
            ref={wrapperRef}
            className={cn('relative inline-flex', className)}
            onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return;
                clearTimeout(closeTimer.current);
                setHovered(true);
            }}
            onPointerLeave={(event) => {
                if (event.pointerType !== 'mouse') return;
                // A short grace period lets the pointer travel from the button into the bubble.
                closeTimer.current = setTimeout(() => setHovered(false), 120);
            }}
        >
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                aria-describedby={open ? tipId : undefined}
                onClick={() => setPinned((value) => !value)}
                onFocus={(event) => {
                    if (event.currentTarget.matches(':focus-visible')) setPinned(true);
                }}
                onBlur={(event) => {
                    if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) close();
                }}
                className={cn(
                    'grid size-6 place-items-center rounded-full text-sm transition-colors',
                    open ? 'text-accent' : 'text-subtle hover:text-accent',
                )}
            >
                <Icon icon={faCircleInfo} />
            </button>

            {open ? (
                <span
                    id={tipId}
                    role="tooltip"
                    className={cn(
                        'absolute bottom-[calc(100%+0.5rem)] z-40 block w-64 max-w-[calc(100vw-2.5rem)] animate-panel-in rounded-xl border border-white/10 bg-raised p-3 text-left font-pixel-sm text-xs leading-relaxed text-white normal-case shadow-float',
                        align === 'end' ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left',
                    )}
                >
                    {title ? <span className="mb-1.5 block text-sm text-accent">{title}</span> : null}
                    <span role="list" className="flex flex-col gap-1">
                        {items.map((item, index) => (
                            <span role="listitem" key={index} className="flex items-start gap-2">
                                <span
                                    aria-hidden
                                    className={cn(
                                        'mt-[0.15rem] grid size-3.5 shrink-0 place-items-center text-[0.65rem]',
                                        item.met === true && 'text-ready',
                                        item.met === false && 'text-danger',
                                        item.met === undefined && 'text-subtle',
                                    )}
                                >
                                    {item.met === undefined ? (
                                        '•'
                                    ) : (
                                        <Icon icon={item.met ? faCheck : faXmark} />
                                    )}
                                </span>
                                <span className={cn(item.met === true && 'text-muted')}>
                                    {item.label}
                                    {item.met !== undefined ? (
                                        <span className="sr-only">{item.met ? ' (done)' : ' (not yet)'}</span>
                                    ) : null}
                                </span>
                            </span>
                        ))}
                    </span>
                    <span
                        aria-hidden
                        className={cn(
                            'absolute top-full size-2.5 -translate-y-1/2 rotate-45 border-r border-b border-white/10 bg-raised',
                            align === 'end' ? 'right-2' : 'left-2',
                        )}
                    />
                </span>
            ) : null}
        </span>
    );
}
