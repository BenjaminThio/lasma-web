/** Result envelope returned by every Server Action. */
export type ActionResult<T = null> =
    { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type AuthField = 'username' | 'email' | 'password' | 'confirmPassword' | 'token';

export interface AuthFormState {
    error?: string;
    /** A neutral success message shown in place of the form's error, e.g. "check your inbox". */
    notice?: string;
    fieldErrors?: Partial<Record<AuthField, string>>;
    /** Echoed back so the form keeps what the user typed (never the password). */
    values?: { email?: string; username?: string; remember?: boolean };
}

export interface SaveAppInput {
    appId?: string;
    name: string;
    description: string;
    status: number;
    tag: number;
    platforms: Record<string, boolean>;
    /** A new image as a data URL; omit to keep the current thumbnail. */
    thumbnail?: string;
}

export interface SaveAppResult {
    appId: string;
    /** Only present right after creation — shown to the owner once. */
    writeKey: string | null;
}

export interface ChangeEmailInput {
    email: string;
    password: string;
}

export interface ChangePasswordInput {
    /** Empty for accounts that don't have a password yet (created with Google). */
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface DeleteAccountInput {
    confirmEmail: string;
    password: string;
}
