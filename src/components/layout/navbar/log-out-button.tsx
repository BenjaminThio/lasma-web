'use client';

import { useFormStatus } from 'react-dom';
import { logOutAction } from '@/server/actions/auth';
import { cn } from '@/lib/cn';

function SubmitButton({ className }: { className?: string }) {
    const { pending } = useFormStatus();

    return (
        <button type="submit" disabled={pending} className={className} aria-busy={pending}>
            {pending ? 'Logging out…' : 'Log Out'}
        </button>
    );
}

/** A real form, so logging out works even before JavaScript has loaded. */
export function LogOutButton({ className, formClassName }: { className?: string; formClassName?: string }) {
    return (
        <form action={logOutAction} className={cn('flex', formClassName)}>
            <SubmitButton className={className} />
        </form>
    );
}
