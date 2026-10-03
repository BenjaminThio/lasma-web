'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ChangeEvent } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Icon } from '@/components/ui/icon';
import { faArrowLeft, faUpload } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/primitives';
import { LightBulb, PLATFORM_ICONS } from '@/components/ui/status';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { LIMITS } from '@/lib/constants';
import {
    APP_STATUS_META,
    APP_STATUSES,
    AppStatus,
    AppTag,
    NO_PLATFORMS,
    PLATFORM_LABEL,
    PLATFORMS,
    type AppStatus as AppStatusValue,
    type AppTag as AppTagValue,
    type EditableApp,
    type Platform,
} from '@/lib/domain';
import { ACCEPTED_IMAGE_TYPES, prepareThumbnail } from '@/lib/image-client';
import { saveAppAction } from '@/server/actions/apps';
import { AppCardFrame } from './app-card';
import { AppDangerZone } from './app-danger-zone';
import { WriteKeyDialog, WriteKeyPanel } from './write-key';

const PLATFORM_OPTIONS: DropdownOption<Platform>[] = PLATFORMS.map((platform) => ({
    option: <Icon icon={PLATFORM_ICONS[platform]} fixedWidth />,
    value: platform,
    title: PLATFORM_LABEL[platform],
}));

const TAG_OPTIONS: DropdownOption<AppTagValue>[] = [
    { option: 'FREE', value: AppTag.Free },
    { option: 'PAID', value: AppTag.Paid },
    { option: 'WEB', value: AppTag.Web },
];

function ModeLabel({ text }: { text: string }) {
    return (
        <>
            <p
                aria-hidden
                className="absolute top-1/2 left-4 hidden -translate-y-1/2 animate-fade-in rounded-2xl border-2 border-white p-4 text-center text-[4.5rem] leading-none xl:block 2xl:left-10 2xl:text-[5rem]"
            >
                {text.split('').map((letter, index) => (
                    <span key={index} className="block">
                        {letter}
                    </span>
                ))}
            </p>
            <p
                aria-hidden
                className="rounded-xl border-2 border-white px-4 py-1 text-2xl tracking-[0.5em] xl:hidden"
            >
                {text}
            </p>
        </>
    );
}

interface AppEditorProps {
    /** Omit to create a new app. */
    app?: EditableApp;
}

export function AppEditor({ app }: AppEditorProps) {
    const router = useRouter();
    const isEditing = app !== undefined;

    const [name, setName] = useState(app?.info.name ?? '');
    const [description, setDescription] = useState(app?.info.description ?? '');
    const [status, setStatus] = useState<AppStatusValue>(app?.info.status ?? AppStatus.Ready);
    const [tag, setTag] = useState<AppTagValue>(app?.info.tag ?? AppTag.Free);
    const [platforms, setPlatforms] = useState(app?.info.platforms ?? NO_PLATFORMS);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [preparingImage, setPreparingImage] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [saving, startSaving] = useTransition();

    const preview = thumbnail ?? app?.thumbnailUrl ?? '/images/galaxy.webp';

    async function handleImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setPreparingImage(true);
        try {
            setThumbnail(await prepareThumbnail(file));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'That image could not be used.');
        } finally {
            setPreparingImage(false);
        }
    }

    function save() {
        startSaving(async () => {
            const result = await saveAppAction({
                appId: app?.id,
                name,
                description,
                status,
                tag,
                platforms,
                thumbnail: thumbnail ?? undefined,
            });

            if (!result.ok) {
                setErrors(result.fieldErrors ?? { form: result.error });
                toast.error(result.error);
                return;
            }

            setErrors({});

            if (result.data.writeKey) {
                setCreatedKey(result.data.writeKey);
                return;
            }

            toast.success('Changes saved.');
            router.push('/console');
        });
    }

    const errorMessages = Object.values(errors);

    return (
        <div className="relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center gap-8 px-4 py-10 sm:py-14">
            <ModeLabel text={isEditing ? 'EDIT' : 'CREATE'} />

            {/* A live preview of the gallery card, drawn at its original 12rem × 17rem size and scaled up. */}
            <div className="relative h-[calc(17rem*var(--card-scale))] w-[calc(12rem*var(--card-scale))] animate-pop-in [--card-scale:1.5] sm:[--card-scale:1.75] lg:[--card-scale:2]">
                <div className="absolute top-0 left-0 w-48 origin-top-left [scale:var(--card-scale)]">
                    <AppCardFrame
                        className="h-68"
                        media={
                            <label className="group/thumb absolute inset-0 cursor-pointer">
                                <input
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                    className="sr-only"
                                    onChange={handleImage}
                                    aria-label="Upload thumbnail"
                                />
                                {preparingImage ? (
                                    <Skeleton className="absolute inset-0 rounded-none" />
                                ) : (
                                    <Image
                                        src={preview}
                                        alt=""
                                        fill
                                        unoptimized
                                        draggable={false}
                                        className="object-cover pixelated"
                                    />
                                )}
                                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-[0.6rem] opacity-0 transition-opacity group-hover/thumb:opacity-100 group-has-focus-visible/thumb:opacity-100">
                                    <Icon icon={faUpload} />
                                    Change image
                                </span>
                            </label>
                        }
                        status={
                            <span role="radiogroup" aria-label="Status" className="flex gap-2">
                                {APP_STATUSES.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={status === value}
                                        aria-label={APP_STATUS_META[value].label}
                                        title={APP_STATUS_META[value].label}
                                        onClick={() => setStatus(value)}
                                        className="flex rounded-full transition-[scale] duration-500 hover:scale-150"
                                    >
                                        <LightBulb
                                            color={status === value ? APP_STATUS_META[value].color : null}
                                        />
                                    </button>
                                ))}
                            </span>
                        }
                        platforms={
                            <Dropdown<Platform>
                                label="Platforms"
                                multiple
                                direction="horizontal"
                                options={PLATFORM_OPTIONS}
                                value={PLATFORMS.filter((platform) => platforms[platform])}
                                onChange={(selected) =>
                                    setPlatforms({
                                        windows: selected.includes('windows'),
                                        linux: selected.includes('linux'),
                                        macOs: selected.includes('macOs'),
                                        android: selected.includes('android'),
                                    })
                                }
                                theme={{
                                    color: '#ffffff',
                                    background: 'rgb(0 0 0 / 0.35)',
                                    hover: 'rgb(255 255 255 / 0.25)',
                                    selected: 'rgb(0 255 127 / 0.35)',
                                    border: '1px solid white',
                                    radius: '0.3rem',
                                    padding: '0.25rem',
                                }}
                                className="text-[0.7rem]"
                            />
                        }
                        title={
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                maxLength={LIMITS.appName}
                                placeholder="Name"
                                aria-label="App name"
                                aria-invalid={errors.name ? true : undefined}
                                className="w-full bg-transparent text-center text-white outline-none placeholder:text-white/40"
                            />
                        }
                        tag={
                            <Dropdown<AppTagValue>
                                label="Tag"
                                options={TAG_OPTIONS}
                                value={tag}
                                onChange={setTag}
                                theme={{
                                    color: '#ffffff',
                                    background: '#282a2c',
                                    hover: '#3a3d41',
                                    selected: '#46484e',
                                    radius: '0.3rem',
                                    padding: '0.3rem',
                                }}
                                className="text-sm"
                            />
                        }
                        description={
                            <>
                                <span aria-hidden>*</span>
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    maxLength={LIMITS.appDescription}
                                    placeholder="Description"
                                    aria-label="Description"
                                    aria-invalid={errors.description ? true : undefined}
                                    className="h-full w-full resize-none bg-transparent text-white outline-none placeholder:text-white/40"
                                />
                            </>
                        }
                    />
                </div>
            </div>

            <div className="flex w-full max-w-2xl flex-col items-center gap-4">
                <p className="text-center font-pixel-sm text-sm text-muted">
                    Click the image to upload a thumbnail, the lights to set a status, and the pencil to pick
                    platforms.
                    <span className="block text-subtle">
                        Name {name.length}/{LIMITS.appName} · Description {description.length}/
                        {LIMITS.appDescription}
                    </span>
                </p>

                {errorMessages.length > 0 ? (
                    <ul
                        role="alert"
                        className="w-full rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 font-pixel-sm text-sm text-danger"
                    >
                        {errorMessages.map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                ) : null}

                <div className="flex flex-wrap justify-center gap-3">
                    <ButtonLink href="/console" variant="ghost">
                        <Icon icon={faArrowLeft} /> Back to console
                    </ButtonLink>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving || preparingImage}
                        className={cn(
                            'inline-flex h-11 items-center rounded-lg bg-accent px-6 text-canvas transition-[scale,background-color] hover:scale-[1.03] hover:bg-accent-deep disabled:opacity-60',
                        )}
                    >
                        {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create app'}
                    </button>
                </div>

                {isEditing ? (
                    <>
                        <WriteKeyPanel appId={app.id} hasWriteKey={app.hasWriteKey} />
                        <AppDangerZone appId={app.id} appName={app.info.name} />
                        <Link
                            href={`/app/${app.id}`}
                            className="font-pixel-sm text-sm text-muted hover:text-white"
                        >
                            View this leaderboard →
                        </Link>
                    </>
                ) : null}
            </div>

            <WriteKeyDialog
                writeKey={createdKey}
                closeLabel="Go to console"
                onClose={() => {
                    setCreatedKey(null);
                    toast.success('App created.');
                    router.push('/console');
                }}
            />
        </div>
    );
}
