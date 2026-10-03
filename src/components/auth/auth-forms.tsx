'use client';

import Link from 'next/link';
import { useActionState, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { faCircleCheck, faCircleUser, faEnvelope, faGoogle, faLock } from '@/components/ui/icons';
import { InfoTip } from '@/components/ui/info-tip';
import { PasswordStrength } from '@/components/ui/password-strength';
import type { AuthFormState } from '@/lib/action-types';
import { cn } from '@/lib/cn';
import { LIMITS } from '@/lib/constants';
import { assessPassword } from '@/lib/password-policy';
import {
    logInAction,
    requestPasswordResetAction,
    resetPasswordAction,
    signUpAction,
} from '@/server/actions/auth';
import {
    LOGIN_PASSWORD_GUIDE,
    confirmPasswordGuide,
    emailGuide,
    newPasswordGuide,
    usernameGuide,
} from './field-guides';
import { AuthField, PasswordField } from './fields';

const INITIAL_STATE: AuthFormState = {};

const primaryButton =
    'mb-3 h-12 w-full rounded-md bg-accent text-base text-canvas shadow-[0_3px_8px_rgb(0_0_0/0.35)] transition-[scale,background-color] duration-500 hover:scale-[1.03] hover:bg-accent-deep disabled:scale-100 disabled:opacity-70';
const googleButton =
    'mb-8 flex h-12 w-full items-center justify-center gap-4 rounded-md bg-white font-sans text-base text-gray-600 shadow-[0_3px_8px_rgb(0_0_0/0.35)] transition-transform duration-500 hover:scale-[1.03]';
const textLink = 'text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent';

function FormMessage({ error, notice }: { error?: string; notice?: string }) {
    if (!error && !notice) return null;

    return (
        <p
            role={error ? 'alert' : 'status'}
            className={cn(
                'mb-4 flex w-full items-start gap-2 rounded-md border px-3 py-2 font-pixel-sm text-sm leading-snug',
                error
                    ? 'border-danger/40 bg-danger/10 text-danger'
                    : 'border-ready/30 bg-ready/10 text-ready',
            )}
        >
            {notice && !error ? <Icon icon={faCircleCheck} className="mt-0.5 shrink-0" /> : null}
            {error ?? notice}
        </p>
    );
}

function RememberMe({ defaultChecked }: { defaultChecked?: boolean }) {
    return (
        <label className="flex cursor-pointer items-center gap-2">
            <input
                type="checkbox"
                name="remember"
                defaultChecked={defaultChecked}
                className="size-4 accent-accent"
            />
            remember me
        </label>
    );
}

function GoogleButton({ label, next }: { label: string; next?: string }) {
    const href = `/api/auth/google?intent=login${next ? `&next=${encodeURIComponent(next)}` : ''}`;

    // A plain link: the flow leaves the app for Google and comes back with a full page load.
    return (
        <a href={href} className={googleButton}>
            <Icon icon={faGoogle} />
            {label}
        </a>
    );
}

function SwitchPrompt({ children }: { children: ReactNode }) {
    return <p className="text-center font-pixel-sm text-sm sm:text-base">{children}</p>;
}

/**
 * React resets `<form action>` fields after every submission, so live mirrors of typed values
 * (used by the tips and the meter) resync from what the server echoed back.
 */
function useEchoedValue(state: AuthFormState, pick: (state: AuthFormState) => string) {
    const [value, setValue] = useState(() => pick(state));
    const [seen, setSeen] = useState(state);

    if (seen !== state) {
        setSeen(state);
        setValue(pick(state));
    }

    return [value, setValue] as const;
}

export function LoginForm({ next }: { next?: string }) {
    const [state, formAction, pending] = useActionState(logInAction, INITIAL_STATE);

    return (
        <form action={formAction} noValidate className="flex w-full flex-col items-center">
            <input type="hidden" name="next" value={next ?? ''} />
            <AuthField
                label="Email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={LIMITS.email}
                defaultValue={state.values?.email}
                error={state.fieldErrors?.email}
                adornment={<Icon icon={faEnvelope} fixedWidth className="mb-2" />}
                tip={<InfoTip label="Email help" items={emailGuide('', 'login')} />}
                className="mb-7"
            />
            <PasswordField
                label="Password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                required
                maxLength={LIMITS.passwordMax}
                error={state.fieldErrors?.password}
                tip={<InfoTip label="Password help" items={LOGIN_PASSWORD_GUIDE} />}
                className="mb-2"
            />
            <div className="mt-3 mb-5 flex w-full items-center justify-between gap-3 px-1 font-pixel-sm text-sm">
                <RememberMe defaultChecked={state.values?.remember} />
                <Link href="/auth/forgot-password" className="hover:text-accent hover:underline">
                    forgot password?
                </Link>
            </div>
            <FormMessage error={state.error} />
            <button type="submit" disabled={pending} aria-busy={pending} className={primaryButton}>
                {pending ? 'Logging in…' : 'Login'}
            </button>
            <GoogleButton label="Sign in with Google" next={next} />
            <SwitchPrompt>
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className={textLink}>
                    Register one.
                </Link>
            </SwitchPrompt>
        </form>
    );
}

export function SignUpForm() {
    const [state, formAction, pending] = useActionState(signUpAction, INITIAL_STATE);
    const [username, setUsername] = useEchoedValue(state, (current) => current.values?.username ?? '');
    const [email, setEmail] = useEchoedValue(state, (current) => current.values?.email ?? '');
    const [password, setPassword] = useEchoedValue(state, () => '');

    const assessment = assessPassword(password, [username, email]);

    return (
        <form action={formAction} noValidate className="flex w-full flex-col items-center">
            <AuthField
                label="Username"
                name="username"
                autoComplete="nickname"
                placeholder="What should we call you?"
                required
                maxLength={LIMITS.username}
                defaultValue={state.values?.username}
                onChange={(event) => setUsername(event.target.value)}
                error={state.fieldErrors?.username}
                adornment={<Icon icon={faCircleUser} fixedWidth className="mb-2" />}
                tip={<InfoTip label="Username requirements" items={usernameGuide(username)} />}
                className="mb-7"
            />
            <AuthField
                label="Email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={LIMITS.email}
                defaultValue={state.values?.email}
                onChange={(event) => setEmail(event.target.value)}
                error={state.fieldErrors?.email}
                adornment={<Icon icon={faEnvelope} fixedWidth className="mb-2" />}
                tip={<InfoTip label="Email requirements" items={emailGuide(email, 'sign-up')} />}
                className="mb-7"
            />
            <PasswordField
                label="Password"
                name="password"
                autoComplete="new-password"
                placeholder={`${LIMITS.passwordMin}+ characters`}
                required
                minLength={LIMITS.passwordMin}
                maxLength={LIMITS.passwordMax}
                onChange={(event) => setPassword(event.target.value)}
                error={state.fieldErrors?.password}
                tip={
                    <InfoTip
                        label="Password requirements"
                        title="Your password needs"
                        items={newPasswordGuide(assessment, password.length > 0)}
                    />
                }
                className="mb-2"
            >
                <PasswordStrength assessment={assessment} visible={password.length > 0} className="mt-2.5" />
            </PasswordField>
            <div className="mt-2 mb-5 flex w-full items-center justify-between px-1 font-pixel-sm text-sm">
                <RememberMe defaultChecked={state.values?.remember} />
            </div>
            <FormMessage error={state.error} />
            <button type="submit" disabled={pending} aria-busy={pending} className={primaryButton}>
                {pending ? 'Creating account…' : 'Sign Up'}
            </button>
            <GoogleButton label="Sign up with Google" />
            <SwitchPrompt>
                Already have an account?{' '}
                <Link href="/auth/login" className={textLink}>
                    Log in.
                </Link>
            </SwitchPrompt>
        </form>
    );
}

export function ForgotPasswordForm({ emailConfigured }: { emailConfigured: boolean }) {
    const [state, formAction, pending] = useActionState(requestPasswordResetAction, INITIAL_STATE);
    const [email, setEmail] = useEchoedValue(state, (current) => current.values?.email ?? '');

    return (
        <form action={formAction} noValidate className="flex w-full flex-col items-center">
            <AuthField
                label="Email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={LIMITS.email}
                defaultValue={state.values?.email}
                onChange={(event) => setEmail(event.target.value)}
                error={state.fieldErrors?.email}
                adornment={<Icon icon={faEnvelope} fixedWidth className="mb-2" />}
                tip={<InfoTip label="Email requirements" items={emailGuide(email, 'reset')} />}
                className="mb-7"
            />
            {emailConfigured ? null : (
                <p className="mb-4 w-full rounded-md border border-building/30 bg-building/10 px-3 py-2 font-pixel-sm text-xs leading-snug text-building">
                    Email delivery isn&apos;t set up on this server yet, so reset links are only written to
                    the server log.
                </p>
            )}
            <FormMessage error={state.error} notice={state.notice} />
            <button type="submit" disabled={pending} aria-busy={pending} className={primaryButton}>
                {pending ? 'Sending…' : state.notice ? 'Send another link' : 'Send reset link'}
            </button>
            <SwitchPrompt>
                Remembered it?{' '}
                <Link href="/auth/login" className={textLink}>
                    Back to login.
                </Link>
            </SwitchPrompt>
        </form>
    );
}

export function ResetPasswordForm({ token }: { token: string }) {
    const [state, formAction, pending] = useActionState(resetPasswordAction, INITIAL_STATE);
    const [password, setPassword] = useEchoedValue(state, () => '');
    const [confirmation, setConfirmation] = useEchoedValue(state, () => '');

    const assessment = assessPassword(password);

    return (
        <form action={formAction} noValidate className="flex w-full flex-col items-center">
            <input type="hidden" name="token" value={token} />
            <PasswordField
                label="New password"
                name="password"
                autoComplete="new-password"
                placeholder={`${LIMITS.passwordMin}+ characters`}
                required
                maxLength={LIMITS.passwordMax}
                onChange={(event) => setPassword(event.target.value)}
                error={state.fieldErrors?.password}
                tip={
                    <InfoTip
                        label="Password requirements"
                        title="Your password needs"
                        items={newPasswordGuide(assessment, password.length > 0)}
                    />
                }
                className="mb-7"
            >
                <PasswordStrength assessment={assessment} visible={password.length > 0} className="mt-2.5" />
            </PasswordField>
            <PasswordField
                label="Confirm password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Type it again"
                required
                maxLength={LIMITS.passwordMax}
                onChange={(event) => setConfirmation(event.target.value)}
                error={state.fieldErrors?.confirmPassword}
                tip={
                    <InfoTip
                        label="Confirmation requirements"
                        items={confirmPasswordGuide(password, confirmation)}
                    />
                }
                className="mb-6"
            />
            <FormMessage error={state.error} />
            <button type="submit" disabled={pending} aria-busy={pending} className={primaryButton}>
                {pending ? 'Saving…' : 'Set new password'}
            </button>
            <p className="flex items-center gap-2 text-center font-pixel-sm text-xs text-subtle">
                <Icon icon={faLock} /> Every device signed in to this account will be signed out.
            </p>
        </form>
    );
}
