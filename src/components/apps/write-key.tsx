'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { faKey } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { WRITE_KEY_HEADER } from '@/lib/constants';
import { rotateWriteKeyAction } from '@/server/actions/apps';

interface WriteKeyDialogProps {
    writeKey: string | null;
    onClose: () => void;
    closeLabel?: string;
}

/** Shows a freshly generated write key. It is never shown again, so the copy step is explicit. */
export function WriteKeyDialog({ writeKey, onClose, closeLabel = 'Done' }: WriteKeyDialogProps) {
    return (
        <Dialog
            open={writeKey !== null}
            onClose={onClose}
            title="Save your write key"
            description={
                <>
                    Your game sends this in the <code className="text-white">{WRITE_KEY_HEADER}</code> header
                    to submit, edit or delete scores. This is the only time it&apos;s shown. If you lose it,
                    generate a new one.
                </>
            }
            footer={<Button onClick={onClose}>{closeLabel}</Button>}
        >
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-canvas py-2 pr-2 pl-3">
                <code className="grow font-mono text-sm break-all text-accent select-all">{writeKey}</code>
                <CopyButton value={writeKey ?? ''} label="Copy write key" text="Copy" />
            </div>
        </Dialog>
    );
}

interface WriteKeyPanelProps {
    appId: string;
    hasWriteKey: boolean;
}

export function WriteKeyPanel({ appId, hasWriteKey }: WriteKeyPanelProps) {
    const [hasKey, setHasKey] = useState(hasWriteKey);
    const [confirming, setConfirming] = useState(false);
    const [revealed, setRevealed] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function generate() {
        startTransition(async () => {
            const result = await rotateWriteKeyAction(appId);

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            setHasKey(true);
            setConfirming(false);
            setRevealed(result.data);
        });
    }

    return (
        <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
            <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon icon={faKey} />
                </span>
                <div className="flex min-w-0 grow flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold">Keys</h2>
                        <span
                            className={cn(
                                'rounded-full px-2.5 py-0.5 font-pixel-sm text-xs',
                                hasKey ? 'bg-ready/15 text-ready' : 'bg-building/15 text-building',
                            )}
                        >
                            {hasKey ? 'Write key active' : 'No write key'}
                        </span>
                    </div>
                    <p className="font-pixel-sm text-sm leading-relaxed text-muted">
                        {hasKey
                            ? `Every score submission, edit and delete must send the write key in the ${WRITE_KEY_HEADER} header.`
                            : 'This app was created before write keys existed, so anyone who knows its App ID can post scores. Generate a key, add it to your game, and it becomes required.'}
                    </p>

                    <div className="mt-2 flex flex-col gap-1">
                        <span className="font-pixel-sm text-xs tracking-widest text-subtle uppercase">
                            App ID
                        </span>
                        <div className="flex items-center gap-2 rounded-lg bg-canvas py-1 pr-1 pl-3">
                            <code className="grow truncate font-mono text-sm select-all">{appId}</code>
                            <CopyButton value={appId} label="Copy app ID" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <Button
                            variant={hasKey ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={pending}
                            onClick={() => (hasKey ? setConfirming(true) : generate())}
                        >
                            <Icon icon={faKey} /> {hasKey ? 'Generate a new write key' : 'Generate write key'}
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog
                open={confirming}
                onClose={() => setConfirming(false)}
                title="Replace the write key?"
                description="The current key stops working immediately. Update your game with the new key before players submit more scores."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={generate} disabled={pending} aria-busy={pending}>
                            {pending ? 'Generating…' : 'Replace key'}
                        </Button>
                    </>
                }
            />
            <WriteKeyDialog writeKey={revealed} onClose={() => setRevealed(null)} />
        </section>
    );
}
