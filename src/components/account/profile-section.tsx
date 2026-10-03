'use client';

import { useState, useTransition, type ChangeEvent, type FormEvent } from 'react';
import { usernameGuide } from '@/components/auth/field-guides';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form-field';
import { Icon } from '@/components/ui/icon';
import { faCamera, faTrashCan, faUserPen } from '@/components/ui/icons';
import { InfoTip } from '@/components/ui/info-tip';
import { Skeleton } from '@/components/ui/primitives';
import { toast } from '@/components/ui/toast';
import { LIMITS } from '@/lib/constants';
import type { AccountOverview } from '@/lib/domain';
import { ACCEPTED_IMAGE_TYPES, prepareAvatar } from '@/lib/image-client';
import { updateAvatarAction, updateUsernameAction } from '@/server/actions/account';
import { AccountSection, FormActions } from './section';

export function ProfileSection({ account }: { account: AccountOverview }) {
    const [username, setUsername] = useState(account.username);
    const [usernameError, setUsernameError] = useState<string>();
    const [savingName, startSavingName] = useTransition();
    const [avatarBusy, startAvatar] = useTransition();
    const [preparing, setPreparing] = useState(false);

    const trimmed = username.trim();
    const unchanged = trimmed === account.username;

    function saveUsername(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startSavingName(async () => {
            const result = await updateUsernameAction(username);

            if (!result.ok) {
                setUsernameError(result.fieldErrors?.username ?? result.error);
                return;
            }
            setUsernameError(undefined);
            setUsername(result.data);
            toast.success('Username updated.');
        });
    }

    async function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setPreparing(true);
        let dataUrl: string;
        try {
            dataUrl = await prepareAvatar(file);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'That image could not be used.');
            return;
        } finally {
            setPreparing(false);
        }

        startAvatar(async () => {
            const result = await updateAvatarAction(dataUrl);
            if (result.ok) toast.success('Profile picture updated.');
            else toast.error(result.error);
        });
    }

    function removeAvatar() {
        startAvatar(async () => {
            const result = await updateAvatarAction(null);
            if (result.ok) toast.success('Profile picture removed.');
            else toast.error(result.error);
        });
    }

    const busy = avatarBusy || preparing;

    return (
        <AccountSection
            id="profile"
            icon={faUserPen}
            title="Profile"
            description="How you appear in the navbar and account menu. Players never see this."
        >
            <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8">
                <div className="flex flex-col items-center gap-3">
                    <label className="group/avatar relative block cursor-pointer rounded-full">
                        <input
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            className="sr-only"
                            onChange={chooseAvatar}
                            disabled={busy}
                            aria-label="Upload a profile picture"
                        />
                        {busy ? (
                            <Skeleton className="size-28 rounded-full" />
                        ) : (
                            <Avatar src={account.avatarUrl} size={112} priority className="size-28" />
                        )}
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/60 font-pixel-sm text-xs opacity-0 transition-opacity group-hover/avatar:opacity-100 group-has-focus-visible/avatar:opacity-100">
                            <Icon icon={faCamera} className="text-lg" />
                            Change
                        </span>
                    </label>
                    {account.avatarUrl ? (
                        <Button variant="ghost" size="sm" onClick={removeAvatar} disabled={busy}>
                            <Icon icon={faTrashCan} /> Remove
                        </Button>
                    ) : (
                        <p className="max-w-32 text-center font-pixel-sm text-xs text-subtle">
                            PNG, JPEG, WebP or GIF, cropped square
                        </p>
                    )}
                </div>

                <form onSubmit={saveUsername} noValidate className="flex min-w-0 flex-col">
                    <TextField
                        label="Username"
                        name="username"
                        autoComplete="nickname"
                        value={username}
                        maxLength={LIMITS.username}
                        onChange={(event) => setUsername(event.target.value)}
                        error={usernameError}
                        hint={`${trimmed.length}/${LIMITS.username} characters`}
                        tip={<InfoTip label="Username requirements" items={usernameGuide(username)} />}
                    />
                    <div className="mt-4 flex flex-col gap-1">
                        <span className="font-pixel-sm text-xs tracking-widest text-muted uppercase">
                            Email
                        </span>
                        <p className="truncate font-pixel-sm text-base" title={account.email}>
                            {account.email}
                        </p>
                    </div>
                    <FormActions>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={unchanged || savingName}
                            onClick={() => {
                                setUsername(account.username);
                                setUsernameError(undefined);
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={unchanged || !trimmed || savingName}
                            aria-busy={savingName}
                        >
                            {savingName ? 'Saving…' : 'Save username'}
                        </Button>
                    </FormActions>
                </form>
            </div>
        </AccountSection>
    );
}
