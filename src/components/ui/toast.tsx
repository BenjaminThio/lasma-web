'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icon';
import { faCircleCheck, faCircleExclamation, faCircleInfo, faXmark } from './icons';

type Tone = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    tone: Tone;
    message: string;
}

const TONE = {
    success: { icon: faCircleCheck, className: 'text-ready' },
    error: { icon: faCircleExclamation, className: 'text-danger' },
    info: { icon: faCircleInfo, className: 'text-accent' },
} as const;

const EMPTY: ToastItem[] = [];
const listeners = new Set<() => void>();
let toasts: ToastItem[] = EMPTY;
let nextId = 1;

function emit() {
    for (const listener of listeners) listener();
}

export function dismissToast(id: number) {
    toasts = toasts.filter((item) => item.id !== id);
    emit();
}

function push(tone: Tone, message: string) {
    const id = nextId++;
    toasts = [...toasts.slice(-3), { id, tone, message }];
    emit();
    setTimeout(() => dismissToast(id), tone === 'error' ? 6500 : 3500);
}

/** Fire-and-forget notifications, callable from anywhere on the client. */
export const toast = {
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
};

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function Toaster() {
    const items = useSyncExternalStore(
        subscribe,
        () => toasts,
        () => EMPTY,
    );

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-4 z-60 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
        >
            {items.map((item) => (
                <div
                    key={item.id}
                    role={item.tone === 'error' ? 'alert' : 'status'}
                    className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border border-white/10 bg-raised/95 px-4 py-3 font-pixel-sm text-sm shadow-float backdrop-blur-sm"
                >
                    <Icon
                        icon={TONE[item.tone].icon}
                        className={cn('mt-0.5 text-base', TONE[item.tone].className)}
                    />
                    <p className="grow leading-snug">{item.message}</p>
                    <button
                        type="button"
                        aria-label="Dismiss notification"
                        onClick={() => dismissToast(item.id)}
                        className="-m-1 rounded p-1 text-muted transition-colors hover:text-white"
                    >
                        <Icon icon={faXmark} />
                    </button>
                </div>
            ))}
        </div>
    );
}
