'use client';

import type { ReactNode } from 'react';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Icon } from '@/components/ui/icon';
import { PLATFORM_ICONS } from '@/components/ui/status';
import { PLATFORM_LABEL, PLATFORMS, type Platform } from '@/lib/domain';

const PLATFORM_OPTIONS: DropdownOption<Platform>[] = PLATFORMS.map((platform) => ({
    option: <Icon icon={PLATFORM_ICONS[platform]} fixedWidth />,
    value: platform,
    title: PLATFORM_LABEL[platform],
}));

function Demo({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <p className="font-pixel-sm text-sm tracking-widest text-subtle uppercase">{label}</p>
            {children}
        </div>
    );
}

export function DropdownDemo() {
    return (
        <div className="grid w-full max-w-4xl animate-pop-in gap-12 text-lg md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8">
                <p className="font-pixel-sm text-sm tracking-widest text-subtle uppercase">Native select</p>
                <select
                    aria-label="Native select"
                    className="h-fit rounded-lg bg-white p-2 text-lg text-black"
                    defaultValue="Hello World"
                >
                    <option>Hello World</option>
                    <option>2</option>
                    <option>3</option>
                </select>
            </div>

            {/* Generous gaps leave room for the menus to slide out below and to the right. */}
            <div className="flex flex-col items-center gap-24 rounded-2xl bg-surface px-4 py-10 pb-36">
                <Demo label="Vertical">
                    <Dropdown<number>
                        label="Vertical dropdown"
                        options={[
                            { option: 'Hello World', value: 0 },
                            { option: '2', value: 1 },
                            { option: '3', value: 2 },
                        ]}
                    />
                </Demo>
                <Demo label="Horizontal">
                    <Dropdown<number>
                        label="Horizontal dropdown"
                        direction="horizontal"
                        options={[
                            { option: 'Ben', value: 0 },
                            { option: 'Teh', value: 1 },
                            { option: 'Thye', value: 2 },
                        ]}
                        className="-translate-x-16"
                    />
                </Demo>
                <Demo label="Icons">
                    <Dropdown<Platform>
                        label="Pick a platform"
                        direction="horizontal"
                        options={PLATFORM_OPTIONS}
                        className="-translate-x-16"
                    />
                </Demo>
                <Demo label="Multi-select">
                    <Dropdown<Platform>
                        label="Pick platforms"
                        multiple
                        direction="horizontal"
                        options={PLATFORM_OPTIONS}
                        className="-translate-x-16"
                    />
                </Demo>
                <Demo label="Themed multi-select">
                    <Dropdown<Platform>
                        label="Pick platforms (themed)"
                        multiple
                        options={PLATFORM_OPTIONS}
                        theme={{
                            color: '#ffffff',
                            background: 'transparent',
                            hover: 'rgb(128 0 128 / 0.45)',
                            selected: 'rgb(128 0 128 / 0.8)',
                            border: '1px solid purple',
                        }}
                    />
                </Demo>
            </div>
        </div>
    );
}
