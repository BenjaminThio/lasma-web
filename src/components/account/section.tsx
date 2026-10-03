import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';

interface AccountSectionProps {
    id: string;
    icon: IconDefinition;
    title: string;
    description: ReactNode;
    /** Top-right action, e.g. "Sign out everywhere else". */
    action?: ReactNode;
    tone?: 'default' | 'danger';
    children: ReactNode;
}

export function AccountSection({
    id,
    icon,
    title,
    description,
    action,
    tone = 'default',
    children,
}: AccountSectionProps) {
    const headingId = `${id}-heading`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn(
                'scroll-mt-20 rounded-2xl border bg-surface p-5 sm:p-6',
                tone === 'danger' ? 'border-danger/25' : 'border-white/[0.06]',
            )}
        >
            <header className="mb-5 flex flex-wrap items-start gap-x-4 gap-y-3">
                <span
                    className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-xl',
                        tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent',
                    )}
                >
                    <Icon icon={icon} />
                </span>
                <div className="min-w-0 grow basis-60">
                    <h2 id={headingId} className="text-xl leading-tight font-bold">
                        {title}
                    </h2>
                    <p className="mt-1 font-pixel-sm text-sm leading-relaxed text-muted">{description}</p>
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </header>
            {children}
        </section>
    );
}

/** A right-aligned row of form buttons with an optional status line on the left. */
export function FormActions({ status, children }: { status?: ReactNode; children: ReactNode }) {
    return (
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-white/[0.06] pt-4">
            {status ? <p className="mr-auto font-pixel-sm text-xs text-subtle">{status}</p> : null}
            {children}
        </div>
    );
}
