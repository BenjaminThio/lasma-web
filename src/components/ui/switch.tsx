'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface SwitchProps {
    /** Accessible name, e.g. "Public". */
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    /** Slide the knob (default) or snap it across instantly. */
    animated?: boolean;
    size?: 'md' | 'sm';
    disabled?: boolean;
    className?: string;
}

const SIZES = {
    md: { track: 'h-12 w-24 p-2', knob: 'size-8', on: 'translate-x-12' },
    sm: { track: 'h-8 w-15 p-1.5', knob: 'size-5', on: 'translate-x-7' },
} as const;

/** The original pill switch (grey track that turns cadet blue on hover), as an accessible checkbox. */
export function Switch({
    label,
    checked,
    defaultChecked = false,
    onCheckedChange,
    animated = true,
    size = 'md',
    disabled = false,
    className,
}: SwitchProps) {
    const [uncontrolled, setUncontrolled] = useState(defaultChecked);
    const isOn = checked ?? uncontrolled;
    const styles = SIZES[size];

    return (
        <label
            className={cn(
                'relative inline-flex shrink-0 cursor-pointer items-center rounded-3xl bg-track',
                'hover:bg-[cadetblue] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
                'has-disabled:cursor-not-allowed has-disabled:opacity-50',
                animated && 'transition-colors duration-500',
                styles.track,
                className,
            )}
        >
            <input
                type="checkbox"
                role="switch"
                className="peer sr-only"
                aria-label={label}
                checked={isOn}
                disabled={disabled}
                onChange={(event) => {
                    if (checked === undefined) setUncontrolled(event.target.checked);
                    onCheckedChange?.(event.target.checked);
                }}
            />
            <span
                aria-hidden
                className={cn(
                    'aspect-square rounded-full bg-white',
                    animated && 'transition-transform duration-100 ease-out',
                    styles.knob,
                    isOn && styles.on,
                )}
            />
        </label>
    );
}
