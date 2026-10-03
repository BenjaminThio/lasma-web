'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { faBroom, faTrashCan, faTriangleExclamation } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { deleteAppAction, resetLeaderboardAction } from '@/server/actions/apps';

type Confirming = 'reset' | 'delete' | null;

const COPY = {
    reset: {
        title: 'Reset this leaderboard?',
        description:
            'Every player and score is deleted. The app, its settings and its write key stay, so your game keeps working and the board starts again from zero.',
        confirm: 'Reset leaderboard',
        pending: 'Resetting…',
    },
    delete: {
        title: 'Delete this app?',
        description:
            'The app, its leaderboard and its write key are deleted permanently. Games still using its App ID will get 404 errors.',
        confirm: 'Delete app',
        pending: 'Deleting…',
    },
} as const;

export function AppDangerZone({ appId, appName }: { appId: string; appName: string }) {
    const router = useRouter();
    const [confirming, setConfirming] = useState<Confirming>(null);
    const [pending, startTransition] = useTransition();

    function confirm() {
        const action = confirming;
        if (!action) return;

        startTransition(async () => {
            const result =
                action === 'reset' ? await resetLeaderboardAction(appId) : await deleteAppAction(appId);

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            setConfirming(null);

            if (action === 'reset') {
                toast.success(`${appName}'s leaderboard is empty again.`);
            } else {
                toast.success(`Deleted ${appName}.`);
                router.push('/console');
            }
        });
    }

    const copy = confirming ? COPY[confirming] : null;

    return (
        <section className="w-full max-w-2xl rounded-2xl border border-danger/25 bg-surface p-5 sm:p-6">
            <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
                    <Icon icon={faTriangleExclamation} />
                </span>
                <div className="flex min-w-0 grow flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Danger zone</h2>
                        <p className="font-pixel-sm text-sm leading-relaxed text-muted">
                            These can&apos;t be undone.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-pixel-sm text-sm">
                            Reset the leaderboard
                            <span className="block text-xs text-subtle">
                                Removes every player. Keeps the app.
                            </span>
                        </p>
                        <Button variant="secondary" size="sm" onClick={() => setConfirming('reset')}>
                            <Icon icon={faBroom} /> Reset leaderboard
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-pixel-sm text-sm">
                            Delete this app
                            <span className="block text-xs text-subtle">Removes the app, board and key.</span>
                        </p>
                        <Button variant="danger" size="sm" onClick={() => setConfirming('delete')}>
                            <Icon icon={faTrashCan} /> Delete app
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog
                open={copy !== null}
                onClose={() => (pending ? undefined : setConfirming(null))}
                title={copy?.title ?? ''}
                description={copy?.description}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirming(null)} disabled={pending}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirm} disabled={pending} aria-busy={pending}>
                            {pending ? copy?.pending : copy?.confirm}
                        </Button>
                    </>
                }
            />
        </section>
    );
}
