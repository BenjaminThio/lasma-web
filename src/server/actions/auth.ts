'use server';

import type { Route } from 'next';
import { redirect, unstable_rethrow } from 'next/navigation';
import { after } from 'next/server';
import type { AuthField, AuthFormState } from '@/lib/action-types';
import { endSession, startSession } from '@/server/auth/session';
import { FieldError } from '@/server/errors';
import { getTrustedOrigin } from '@/server/http/base-url';
import { logger } from '@/server/logger';
import { consume, describeWait, RATE_LIMITS } from '@/server/security/rate-limit';
import { getClientIp, safeRedirectPath } from '@/server/security/request';
import { authenticate, registerAccount } from '@/server/services/accounts';
import { requestPasswordReset, resetPassword } from '@/server/services/password-reset';
import {
    fieldErrors,
    forgotPasswordSchema,
    logInSchema,
    resetPasswordSchema,
    signUpSchema,
} from '@/server/validation';

const GENERIC_FAILURE = 'Something went wrong on our side. Please try again.';

function field(formData: FormData, name: string, maxLength = 512): string {
    const value = formData.get(name);
    return typeof value === 'string' ? value.slice(0, maxLength) : '';
}

export async function logInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const typedEmail = field(formData, 'email', 320);
    const remember = formData.get('remember') === 'on';
    const values = { email: typedEmail, remember };

    // Malformed input never touches the database, so it isn't counted against the limits.
    const parsed = logInSchema.safeParse({
        email: typedEmail,
        password: field(formData, 'password', 256),
        remember,
    });
    if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

    const ipLimit = await consume(`login:ip:${await getClientIp()}`, RATE_LIMITS.loginPerIp);
    if (!ipLimit.ok) {
        return {
            error: `Too many attempts. Try again in ${describeWait(ipLimit.retryAfterSeconds)}.`,
            values,
        };
    }

    const emailLimit = await consume(`login:email:${parsed.data.email}`, RATE_LIMITS.loginPerEmail);
    if (!emailLimit.ok) {
        return {
            error: `Too many attempts for this account. Try again in ${describeWait(emailLimit.retryAfterSeconds)}.`,
            values,
        };
    }

    try {
        const user = await authenticate(parsed.data.email, parsed.data.password, typedEmail);
        if (!user) return { error: 'Incorrect email or password.', values };

        await startSession(user, parsed.data.remember);
    } catch (error) {
        unstable_rethrow(error);
        logger.error('Login failed unexpectedly', { error });
        return { error: GENERIC_FAILURE, values };
    }

    redirect(safeRedirectPath(formData.get('next'), '/console') as Route);
}

export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const remember = formData.get('remember') === 'on';
    const values = {
        email: field(formData, 'email', 320),
        username: field(formData, 'username', 120),
        remember,
    };

    const parsed = signUpSchema.safeParse({ ...values, password: field(formData, 'password', 256) });
    if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

    const limit = await consume(`signup:ip:${await getClientIp()}`, RATE_LIMITS.signUpPerIp);
    if (!limit.ok) {
        return {
            error: `Too many sign-ups from your network. Try again in ${describeWait(limit.retryAfterSeconds)}.`,
            values,
        };
    }

    try {
        const user = await registerAccount(parsed.data);
        if (!user) {
            return {
                fieldErrors: { email: 'An account with this email already exists. Try logging in.' },
                values,
            };
        }

        await startSession(user, parsed.data.remember);
    } catch (error) {
        unstable_rethrow(error);
        logger.error('Sign-up failed unexpectedly', { error });
        return { error: GENERIC_FAILURE, values };
    }

    redirect('/console');
}

export async function logOutAction(): Promise<void> {
    await endSession();
    redirect('/');
}

export async function requestPasswordResetAction(
    _previous: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const typedEmail = field(formData, 'email', 320);
    const values = { email: typedEmail };

    const parsed = forgotPasswordSchema.safeParse({ email: typedEmail });
    if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

    const ipLimit = await consume(`reset:ip:${await getClientIp()}`, RATE_LIMITS.passwordResetPerIp);
    if (!ipLimit.ok) {
        return {
            error: `Too many reset requests. Try again in ${describeWait(ipLimit.retryAfterSeconds)}.`,
            values,
        };
    }

    const { email } = parsed.data;
    const emailLimit = await consume(`reset:email:${email}`, RATE_LIMITS.passwordResetPerEmail);

    // The answer and its timing are the same whether or not the account exists: the lookup and
    // the email happen after the response is sent.
    if (emailLimit.ok) {
        const origin = await getTrustedOrigin();
        after(() =>
            requestPasswordReset(email, typedEmail, origin).catch((error: unknown) =>
                logger.error('Failed to send a password reset email', { error }),
            ),
        );
    }

    return {
        notice: `If ${email} has an account, a reset link is on its way. It works once and expires in 30 minutes.`,
        values,
    };
}

export async function resetPasswordAction(
    _previous: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const parsed = resetPasswordSchema.safeParse({
        token: field(formData, 'token', 64),
        password: field(formData, 'password', 256),
        confirmPassword: field(formData, 'confirmPassword', 256),
    });
    if (!parsed.success) {
        const errors = fieldErrors(parsed.error);
        return { fieldErrors: errors, error: errors.token };
    }

    const limit = await consume(`reset-confirm:ip:${await getClientIp()}`, RATE_LIMITS.loginPerIp);
    if (!limit.ok) {
        return { error: `Too many attempts. Try again in ${describeWait(limit.retryAfterSeconds)}.` };
    }

    try {
        const user = await resetPassword(parsed.data.token, parsed.data.password);
        await startSession(user, false);
    } catch (error) {
        unstable_rethrow(error);

        if (error instanceof FieldError) {
            return {
                fieldErrors: { [error.field as AuthField]: error.message },
                error: error.field === 'token' ? error.message : undefined,
            };
        }
        logger.error('Password reset failed unexpectedly', { error });
        return { error: GENERIC_FAILURE };
    }

    redirect('/console?flash=password_reset' as Route);
}
