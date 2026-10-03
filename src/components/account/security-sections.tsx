'use client';

import { useState, useTransition, type FormEvent } from 'react';
import {
    CURRENT_PASSWORD_GUIDE,
    confirmPasswordGuide,
    emailGuide,
    newPasswordGuide,
} from '@/components/auth/field-guides';
import { Button, buttonClasses } from '@/components/ui/button';
import { PasswordField, TextField } from '@/components/ui/form-field';
import { Icon } from '@/components/ui/icon';
import { faEnvelope, faGoogle, faLink, faLinkSlash, faLock, faShieldHalved } from '@/components/ui/icons';
import { InfoTip } from '@/components/ui/info-tip';
import { PasswordStrength } from '@/components/ui/password-strength';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { LIMITS } from '@/lib/constants';
import type { AccountOverview } from '@/lib/domain';
import { pluralize } from '@/lib/format';
import { assessPassword } from '@/lib/password-policy';
import { changeEmailAction, changePasswordAction, unlinkGoogleAction } from '@/server/actions/account';
import { AccountSection, FormActions } from './section';

type Errors = Record<string, string | undefined>;

export function EmailSection({ account }: { account: AccountOverview }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [pending, startTransition] = useTransition();

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(async () => {
            const result = await changeEmailAction({ email, password });

            if (!result.ok) {
                setErrors(result.fieldErrors ?? { form: result.error });
                if (!result.fieldErrors) toast.error(result.error);
                return;
            }

            setErrors({});
            setEmail('');
            setPassword('');
            toast.success(`Your email is now ${result.data}. Other devices were signed out.`);
        });
    }

    return (
        <AccountSection
            id="email"
            icon={faEnvelope}
            title="Email"
            description={
                <>
                    You log in with <span className="text-white">{account.email}</span>. Your apps move with
                    you when you change it.
                </>
            }
        >
            {account.hasPassword ? (
                <form onSubmit={submit} noValidate>
                    <div className="grid gap-4 md:grid-cols-2">
                        <TextField
                            label="New email"
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            maxLength={LIMITS.email}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            error={errors.email}
                            tip={
                                <InfoTip label="New email requirements" items={emailGuide(email, 'change')} />
                            }
                        />
                        <PasswordField
                            label="Current password"
                            name="current-password"
                            autoComplete="current-password"
                            maxLength={LIMITS.passwordMax}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            error={errors.password}
                            tip={
                                <InfoTip label="Why your password is needed" items={CURRENT_PASSWORD_GUIDE} />
                            }
                        />
                    </div>
                    <FormActions>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={pending || !email || !password}
                            aria-busy={pending}
                        >
                            {pending ? 'Changing…' : 'Change email'}
                        </Button>
                    </FormActions>
                </form>
            ) : (
                <p className="rounded-lg bg-canvas px-4 py-3 font-pixel-sm text-sm text-muted">
                    Your account signs in with Google. Set a password below first, then you can change your
                    email here.
                </p>
            )}
        </AccountSection>
    );
}

export function PasswordSection({ account }: { account: AccountOverview }) {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [pending, startTransition] = useTransition();

    const assessment = assessPassword(next, [account.username, account.email]);
    const ready = next.length > 0 && confirmation.length > 0 && (!account.hasPassword || current.length > 0);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(async () => {
            const result = await changePasswordAction({
                currentPassword: current,
                newPassword: next,
                confirmPassword: confirmation,
            });

            if (!result.ok) {
                setErrors(result.fieldErrors ?? {});
                if (!result.fieldErrors) toast.error(result.error);
                return;
            }

            setErrors({});
            setCurrent('');
            setNext('');
            setConfirmation('');
            toast.success(
                result.data > 0
                    ? `Password updated. Signed out ${pluralize(result.data, 'other session')}.`
                    : 'Password updated.',
            );
        });
    }

    return (
        <AccountSection
            id="password"
            icon={faLock}
            title={account.hasPassword ? 'Password' : 'Set a password'}
            description={
                account.hasPassword
                    ? 'Changing it signs out every other device.'
                    : 'Add a password so you can log in without Google, change your email, or disconnect Google.'
            }
        >
            <form onSubmit={submit} noValidate className="grid gap-4 md:grid-cols-2">
                {account.hasPassword ? (
                    <PasswordField
                        label="Current password"
                        name="current-password"
                        autoComplete="current-password"
                        maxLength={LIMITS.passwordMax}
                        value={current}
                        onChange={(event) => setCurrent(event.target.value)}
                        error={errors.currentPassword}
                        tip={<InfoTip label="Why your password is needed" items={CURRENT_PASSWORD_GUIDE} />}
                        className="md:col-span-2 md:max-w-[calc(50%-0.5rem)]"
                    />
                ) : null}
                <PasswordField
                    label="New password"
                    name="new-password"
                    autoComplete="new-password"
                    maxLength={LIMITS.passwordMax}
                    value={next}
                    onChange={(event) => setNext(event.target.value)}
                    error={errors.newPassword}
                    tip={
                        <InfoTip
                            label="New password requirements"
                            title="Your password needs"
                            items={newPasswordGuide(assessment, next.length > 0)}
                        />
                    }
                >
                    <PasswordStrength assessment={assessment} visible={next.length > 0} />
                </PasswordField>
                <PasswordField
                    label="Confirm new password"
                    name="confirm-password"
                    autoComplete="new-password"
                    maxLength={LIMITS.passwordMax}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    error={errors.confirmPassword}
                    tip={
                        <InfoTip
                            label="Confirmation requirements"
                            items={confirmPasswordGuide(next, confirmation)}
                        />
                    }
                />
                <div className="md:col-span-2">
                    <FormActions>
                        <Button type="submit" size="sm" disabled={pending || !ready} aria-busy={pending}>
                            {pending ? 'Saving…' : account.hasPassword ? 'Change password' : 'Set password'}
                        </Button>
                    </FormActions>
                </div>
            </form>
        </AccountSection>
    );
}

export function ConnectionsSection({
    account,
    googleAvailable,
}: {
    account: AccountOverview;
    googleAvailable: boolean;
}) {
    const [pending, startTransition] = useTransition();

    function disconnect() {
        startTransition(async () => {
            const result = await unlinkGoogleAction();
            if (result.ok) toast.success('Google disconnected.');
            else toast.error(result.error);
        });
    }

    return (
        <AccountSection
            id="connections"
            icon={faShieldHalved}
            title="Sign-in methods"
            description="Ways you can log in to this account."
        >
            <ul className="flex flex-col gap-2">
                <li className="flex flex-wrap items-center gap-3 rounded-xl bg-canvas px-4 py-3">
                    <Icon icon={faLock} fixedWidth className="text-muted" />
                    <span className="grow">Email and password</span>
                    <StatusPill on={account.hasPassword} onLabel="Active" offLabel="Not set" />
                </li>
                <li className="flex flex-wrap items-center gap-3 rounded-xl bg-canvas px-4 py-3">
                    <Icon icon={faGoogle} fixedWidth className="text-muted" />
                    <span className="grow">Google</span>
                    <StatusPill on={account.googleLinked} onLabel="Connected" offLabel="Not connected" />
                    {account.googleLinked ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={disconnect}
                            disabled={pending || !account.hasPassword}
                            title={account.hasPassword ? undefined : 'Set a password first'}
                        >
                            <Icon icon={faLinkSlash} /> Disconnect
                        </Button>
                    ) : googleAvailable ? (
                        <a
                            href="/api/auth/google?intent=link"
                            className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                        >
                            <Icon icon={faLink} /> Connect
                        </a>
                    ) : (
                        <span className="font-pixel-sm text-xs text-subtle">
                            Not available on this server
                        </span>
                    )}
                </li>
            </ul>
        </AccountSection>
    );
}

function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-0.5 font-pixel-sm text-xs',
                on ? 'bg-ready/15 text-ready' : 'bg-white/5 text-subtle',
            )}
        >
            {on ? onLabel : offLabel}
        </span>
    );
}
