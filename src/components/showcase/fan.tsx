'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent } from 'react';
import { yiFanClosed, yiFanOpen } from '@/config/assets';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

/** Tap the spinning fan, hear the pop, watch the counter climb. */
export function Fan() {
    const [count, setCount] = useState(0);
    const [pressed, setPressed] = useState(false);
    const soundRef = useRef<HTMLAudioElement | null>(null);

    function pop() {
        setCount((value) => value + 1);

        soundRef.current ??= new Audio('/sounds/pop.ogg');
        // Clone so rapid taps overlap instead of cutting each other off.
        const sound = soundRef.current.cloneNode() as HTMLAudioElement;
        void sound.play().catch(() => undefined);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        setPressed(true);
        pop();
    }

    return (
        <div className="flex flex-col items-center gap-6">
            <button
                type="button"
                aria-label="Pop Yi Fan"
                onPointerDown={() => {
                    setPressed(true);
                    pop();
                }}
                onPointerUp={() => setPressed(false)}
                onPointerLeave={() => setPressed(false)}
                onPointerCancel={() => setPressed(false)}
                onKeyDown={handleKeyDown}
                onKeyUp={() => setPressed(false)}
                className="relative aspect-[359/512] w-[min(62vw,20rem)] animate-fan touch-manipulation rounded-3xl"
            >
                <Image
                    src={yiFanClosed}
                    alt=""
                    fill
                    priority
                    draggable={false}
                    sizes="(min-width: 640px) 20rem, 62vw"
                    className={cn('object-fill', pressed && 'opacity-0')}
                />
                <Image
                    src={yiFanOpen}
                    alt=""
                    fill
                    loading="eager"
                    draggable={false}
                    sizes="(min-width: 640px) 20rem, 62vw"
                    className={cn('object-fill', !pressed && 'opacity-0')}
                />
            </button>
            <p aria-live="polite" className="text-6xl tabular-nums">
                {formatNumber(count)}
            </p>
        </div>
    );
}
