'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { faEye, faEyeSlash } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

interface AuthFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
    label: string;
    error?: string;
    adornment?: ReactNode;
    /** The requirements tip, shown at the end of the label row. */
    tip?: ReactNode;
    /** Content under the underline, e.g. the password strength meter. */
    children?: ReactNode;
}

/** Underlined input from the original auth card; the text slides right when focused. */
export function AuthField({ label, error, adornment, tip, children, className, ...props }: AuthFieldProps) {
    const inputId = useId();
    const errorId = `${inputId}-error`;

    return (
        <div className={cn('group/field w-full', className)}>
            <div className="mb-1.5 flex min-h-6 items-center justify-between gap-2">
                <label
                    htmlFor={inputId}
                    className="font-pixel-sm text-xs tracking-widest text-muted uppercase transition-colors group-focus-within/field:text-accent"
                >
                    {label}
                </label>
                {tip}
            </div>
            <div
                className={cn(
                    'flex w-full items-center gap-2 border-b-2 transition-colors',
                    error ? 'border-danger' : 'border-line focus-within:border-accent hover:border-track',
                )}
            >
                <input
                    id={inputId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="w-full min-w-0 bg-transparent pb-2 font-pixel-sm text-base text-white transition-[padding] duration-500 placeholder:text-subtle focus:pl-3 focus:outline-none"
                    {...props}
                />
                <span className="contents text-muted group-focus-within/field:text-accent">{adornment}</span>
            </div>
            {error ? (
                <p id={errorId} className="mt-1.5 font-pixel-sm text-xs leading-snug text-danger">
                    {error}
                </p>
            ) : null}
            {children}
        </div>
    );
}

export function PasswordField(props: Omit<AuthFieldProps, 'type' | 'adornment'>) {
    const [visible, setVisible] = useState(false);

    return (
        <AuthField
            {...props}
            type={visible ? 'text' : 'password'}
            adornment={
                <button
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                    className="pb-2 transition-transform duration-500 hover:scale-125"
                >
                    <Icon icon={visible ? faEye : faEyeSlash} fixedWidth />
                </button>
            }
        />
    );
}
