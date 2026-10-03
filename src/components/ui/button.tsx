import type { Route } from 'next';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn, hasUtility } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-canvas hover:bg-accent-deep',
    secondary: 'bg-raised text-white hover:bg-raised-hover',
    outline: 'border-2 border-accent-deep bg-transparent text-white hover:bg-accent/10',
    ghost: 'bg-transparent text-white hover:bg-white/8',
    danger: 'bg-danger text-white hover:bg-halt',
    light: 'bg-white text-black hover:bg-white/90',
};

const SIZES: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    icon: 'size-10 text-lg',
};

interface StyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
}

export function buttonClasses({ variant = 'primary', size = 'md', className }: StyleOptions = {}): string {
    return cn(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
        !hasUtility(className, /^rounded(-|$)/) && 'rounded-lg',
        !hasUtility(className, /^font-(pixel|mars|sans|mono)/) && 'font-pixel',
        'transition-[scale,background-color,color,border-color,opacity] duration-200 ease-out',
        'hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        'aria-disabled:pointer-events-none aria-disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
    );
}

interface ButtonProps extends ComponentProps<'button'>, Omit<StyleOptions, 'className'> {}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
    return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

interface ButtonLinkProps extends Omit<ComponentProps<'a'>, 'href'>, Omit<StyleOptions, 'className'> {
    href: Route;
    prefetch?: boolean;
}

export function ButtonLink({ href, variant, size, className, prefetch, ...props }: ButtonLinkProps) {
    return (
        <Link
            href={href}
            prefetch={prefetch}
            className={buttonClasses({ variant, size, className })}
            {...props}
        />
    );
}
