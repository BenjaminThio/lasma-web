'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icon';
import { faEye, faEyeSlash } from './icons';

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
    label: string;
    error?: string;
    /** Shown under the input when there is no error. */
    hint?: ReactNode;
    /** Usually an `<InfoTip>`, placed at the end of the label row. */
    tip?: ReactNode;
    adornment?: ReactNode;
    /** Extra content between the input and the error/hint (e.g. a strength meter). */
    children?: ReactNode;
    id?: string;
}

/** Labelled dark input used on app pages (the account page, dialogs). */
export function TextField({
    label,
    error,
    hint,
    tip,
    adornment,
    children,
    className,
    id,
    ...props
}: TextFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const message = error ?? hint;

    return (
        <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
            <div className="flex min-h-6 items-center justify-between gap-2">
                <label
                    htmlFor={inputId}
                    className="font-pixel-sm text-xs tracking-widest text-muted uppercase"
                >
                    {label}
                </label>
                {tip}
            </div>
            <div
                className={cn(
                    'flex h-11 items-center gap-1 rounded-lg border bg-canvas pr-1 pl-3 transition-colors focus-within:border-accent',
                    error ? 'border-danger/70' : 'border-white/10 hover:border-white/20',
                )}
            >
                <input
                    id={inputId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={message ? messageId : undefined}
                    className="h-full w-full min-w-0 bg-transparent font-pixel-sm text-base outline-none placeholder:text-subtle focus-visible:outline-none"
                    {...props}
                />
                {adornment}
            </div>
            {children}
            {message ? (
                <p
                    id={messageId}
                    className={cn(
                        'font-pixel-sm text-xs leading-snug',
                        error ? 'text-danger' : 'text-subtle',
                    )}
                >
                    {message}
                </p>
            ) : null}
        </div>
    );
}

/** A password input with a show/hide toggle. */
export function PasswordField(props: Omit<TextFieldProps, 'type' | 'adornment'>) {
    const [visible, setVisible] = useState(false);

    return (
        <TextField
            {...props}
            type={visible ? 'text' : 'password'}
            adornment={
                <button
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                    className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-white/8 hover:text-white"
                >
                    <Icon icon={visible ? faEye : faEyeSlash} fixedWidth />
                </button>
            }
        />
    );
}
