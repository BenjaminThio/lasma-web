'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

function DemoRow({ animated, defaultChecked }: { animated: boolean; defaultChecked: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <div className="flex w-full items-center justify-between gap-6 rounded-2xl bg-surface px-5 py-4">
            <div>
                <p className="text-lg">{animated ? 'Animated' : 'Instant'}</p>
                <p className="font-pixel-sm text-sm text-muted">{checked ? 'On' : 'Off'}</p>
            </div>
            <Switch
                label={animated ? 'Animated switch' : 'Instant switch'}
                animated={animated}
                checked={checked}
                onCheckedChange={setChecked}
            />
        </div>
    );
}

export function SwitchDemo() {
    return (
        <div className="flex w-full max-w-sm animate-pop-in flex-col gap-4">
            <DemoRow animated defaultChecked />
            <DemoRow animated={false} defaultChecked={false} />
        </div>
    );
}
