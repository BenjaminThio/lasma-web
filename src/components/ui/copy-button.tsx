'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icon';
import { faCheck, faClipboard } from './icons';
import { toast } from './toast';

interface CopyButtonProps {
    value: string;
    /** Accessible label, e.g. "Copy app ID". */
    label: string;
    /** Show a text label next to the icon. */
    text?: string;
    className?: string;
}

export function CopyButton({ value, label, text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error('Could not copy automatically. Select the text and copy it instead.');
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-muted transition-colors hover:bg-white/8 hover:text-white',
                copied && 'text-ready hover:text-ready',
                className,
            )}
        >
            <Icon icon={copied ? faCheck : faClipboard} fixedWidth />
            {text ? <span className="text-sm">{copied ? 'Copied' : text}</span> : null}
            <span className="sr-only" aria-live="polite">
                {copied ? 'Copied' : ''}
            </span>
        </button>
    );
}
