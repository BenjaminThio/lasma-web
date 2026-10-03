import type { InfoTipItem } from '@/components/ui/info-tip';
import { LIMITS } from '@/lib/constants';
import type { PasswordAssessment } from '@/lib/password-policy';

/*
 * Requirement lists for the "i" tips next to form labels. Each takes the field's current value so
 * the list ticks itself off while the user types. The server enforces the same rules.
 */

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function usernameGuide(value: string): InfoTipItem[] {
    const length = value.trim().length;

    return [
        { label: `1 to ${LIMITS.username} characters`, met: length >= 1 && length <= LIMITS.username },
        { label: 'Shown on your profile and account menu' },
        { label: 'Letters, numbers, spaces and symbols are all fine. You can change it later.' },
    ];
}

export function emailGuide(value: string, purpose: 'sign-up' | 'login' | 'reset' | 'change'): InfoTipItem[] {
    const shaped = EMAIL_SHAPE.test(value.trim()) && value.trim().length <= LIMITS.email;

    switch (purpose) {
        case 'login':
            return [{ label: 'The email you signed up with' }, { label: 'Not case-sensitive' }];
        case 'reset':
            return [
                { label: 'A valid address, like you@example.com', met: shaped },
                { label: 'If it has an account, a reset link arrives within a minute' },
                { label: 'The link works once and expires in 30 minutes' },
            ];
        case 'change':
            return [
                { label: 'A valid address, like you@example.com', met: shaped },
                { label: 'Not used by another account' },
                { label: 'You stay signed in here; other devices are signed out' },
            ];
        case 'sign-up':
            return [
                { label: 'A valid address, like you@example.com', met: shaped },
                { label: `Up to ${LIMITS.email} characters` },
                { label: 'Used to log in and to reset your password' },
            ];
    }
}

export function newPasswordGuide(assessment: PasswordAssessment, typed: boolean): InfoTipItem[] {
    return [
        ...assessment.requirements.map((requirement) => ({
            label: requirement.label,
            met: typed ? requirement.met : undefined,
        })),
        { label: 'Tip: three or four random words make a long password that is easy to remember' },
    ];
}

export function confirmPasswordGuide(password: string, confirmation: string): InfoTipItem[] {
    return [{ label: 'Matches the new password', met: confirmation ? confirmation === password : undefined }];
}

export const LOGIN_PASSWORD_GUIDE: InfoTipItem[] = [
    { label: 'Case-sensitive' },
    { label: 'Forgot it? Use "forgot password?" below to get a reset link by email' },
];

export const CURRENT_PASSWORD_GUIDE: InfoTipItem[] = [
    { label: 'The password you log in with now' },
    { label: 'Needed so nobody using this browser can change your account without it' },
];
