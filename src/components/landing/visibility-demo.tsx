'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function VisibilityDemo() {
    const [isPublic, setIsPublic] = useState(true);

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-raised p-4">
            <div>
                <p className="text-lg">{isPublic ? 'Public' : 'Private'}</p>
                <p className="font-pixel-sm text-sm text-muted">
                    {isPublic ? 'Listed in the apps gallery' : 'Hidden from the gallery'}
                </p>
            </div>
            <Switch label="Public" size="sm" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
    );
}
