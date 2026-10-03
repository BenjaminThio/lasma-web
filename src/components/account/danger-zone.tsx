'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { PasswordField, TextField } from '@/components/ui/form-field';
import { Icon } from '@/components/ui/icon';
import { faTrashCan, faTriangleExclamation } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { LIMITS } from '@/lib/constants';
import type { AccountOverview } from '@/lib/domain';
import { pluralize } from '@/lib/format';
import { deleteAccountAction } from '@/server/actions/account';
import { AccountSection } from './section';

export function DangerZone({ account, appCount }: { account: AccountOverview; appCount: number }) {
    const [open, setOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [pending, startTransition] = useTransition();

    const confirmed =
        confirmEmail.trim().toLowerCase() === account.email.toLowerCase() &&
        (!account.hasPassword || password.length > 0);

    function close() {
        if (pending) return;
        setOpen(false);
        setConfirmEmail('');
        setPassword('');
        setErrors({});
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(async () => {
            // Succeeds by redirecting home, so only failures come back here.
            const result = await deleteAccountAction({ confirmEmail, password });

            if (!result.ok) {
                setErrors(result.fieldErrors ?? {});
                if (!result.fieldErrors) toast.error(result.error);
            }
        });
    }

    return (
        <AccountSection
            id="danger"
            icon={faTriangleExclamation}
            title="Delete account"
            tone="danger"
            description={`Permanently deletes your account, ${pluralize(appCount, 'app')} and every leaderboard in them. Games using those apps stop receiving scores.`}
        >
            <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
                <Icon icon={faTrashCan} /> Delete my account
            </Button>

            <Dialog
                open={open}
                onClose={close}
                title="Delete your account?"
                description="This can't be undone. There is no backup to restore from."
            >
                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                    <ul className="list-inside list-disc rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 font-pixel-sm text-sm leading-relaxed text-muted">
                        <li>Your profile, sessions and password</li>
                        <li>{pluralize(appCount, 'app')} and all of their players and scores</li>
                        <li>Every write key, so your games can no longer post scores</li>
                    </ul>
                    <TextField
                        label={`Type ${account.email} to confirm`}
                        name="confirm-email"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={LIMITS.email}
                        value={confirmEmail}
                        onChange={(event) => setConfirmEmail(event.target.value)}
                        error={errors.confirmEmail}
                    />
                    {account.hasPassword ? (
                        <PasswordField
                            label="Password"
                            name="password"
                            autoComplete="current-password"
                            maxLength={LIMITS.passwordMax}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            error={errors.password}
                        />
                    ) : null}
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                        <Button variant="ghost" onClick={close} disabled={pending}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            disabled={!confirmed || pending}
                            aria-busy={pending}
                        >
                            {pending ? 'Deleting…' : 'Delete forever'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </AccountSection>
    );
}
