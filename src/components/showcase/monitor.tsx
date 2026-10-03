'use client';

import { useEffect, useEffectEvent, useRef, useState, type ChangeEvent } from 'react';
import { Icon } from '@/components/ui/icon';
import { faClipboard, faClipboardCheck, faPause, faPlay } from '@/components/ui/icons';
import { LightBulb } from '@/components/ui/status';
import { toast } from '@/components/ui/toast';
import { bulbCss, COLOR_FORMAT_LABEL, ColorFormat, hexToRgb, rgbToHex } from '@/lib/color';

type Channels = [number, number, number];

interface SliderRowProps {
    name: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
}

function SliderRow({ name, min, max, step = 1, value, onChange }: SliderRowProps) {
    const width = Math.max(String(max).length, String(step).length);

    function handleText(event: ChangeEvent<HTMLInputElement>) {
        const parsed = Number.parseFloat(event.target.value);
        onChange(Number.isNaN(parsed) ? min : Math.min(max, Math.max(min, parsed)));
    }

    return (
        <tr>
            <td className="w-[4.5rem] rounded-lg border border-white px-2 py-1.5 text-center text-sm whitespace-nowrap">
                {name}
            </td>
            <td className="w-full px-1">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    aria-label={name}
                    onChange={(event) => onChange(Number.parseFloat(event.target.value))}
                    className="w-full"
                />
            </td>
            <td className="rounded-lg border border-white px-2 py-1.5 text-center">
                <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`${name} value`}
                    value={value}
                    maxLength={width}
                    onChange={handleText}
                    style={{ width: `${width}ch` }}
                    className="bg-transparent text-center outline-none"
                />
            </td>
        </tr>
    );
}

const FORMATS = [ColorFormat.Rgb, ColorFormat.Hex, ColorFormat.Hsl] as const;

/** Live light-bulb editor: tune colour, size and bloom, then copy the CSS. */
export function Monitor() {
    const [scale, setScale] = useState(10);
    const [channels, setChannels] = useState<Channels>([0, 0, 0]);
    const [bloom, setBloom] = useState(1);
    const [format, setFormat] = useState<ColorFormat>(ColorFormat.Hex);
    const [copied, setCopied] = useState(false);
    const [playing, setPlaying] = useState(false);
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const drift = useRef<{ direction: Channels; bloomDirection: number; channel: 0 | 1 | 2; ticks: number }>({
        direction: [1, 1, 1],
        bloomDirection: 1,
        channel: 0,
        ticks: 0,
    });

    const hex = rgbToHex(channels);

    // While the music plays, one channel at a time drifts up and down and the bloom breathes.
    const tick = useEffectEvent(() => {
        const state = drift.current;
        state.ticks += 1;
        if (state.ticks % 20 === 1) state.channel = Math.floor(Math.random() * 3) as 0 | 1 | 2;

        const index = state.channel;
        const value = channels[index];
        if (value + 5 * state.direction[index] > 255 || value + 5 * state.direction[index] < 0) {
            state.direction[index] = -state.direction[index];
        }

        const next: Channels = [...channels];
        next[index] = Math.min(255, Math.max(0, value + 5 * state.direction[index]));
        setChannels(next);

        if (bloom + 0.1 * state.bloomDirection > 1 || bloom + 0.1 * state.bloomDirection < 0) {
            state.bloomDirection *= -1;
        }
        setBloom(Math.round((bloom + 0.1 * state.bloomDirection) * 10) / 10);
    });

    useEffect(() => {
        if (!playing) return;
        const interval = setInterval(tick, 50);
        return () => clearInterval(interval);
    }, [playing]);

    useEffect(() => () => musicRef.current?.pause(), []);

    function toggleMusic() {
        musicRef.current ??= Object.assign(new Audio('/sounds/chill.ogg'), { loop: true });
        const music = musicRef.current;

        if (music.paused) {
            void music.play().then(
                () => setPlaying(true),
                () => toast.error('Your browser blocked audio playback.'),
            );
        } else {
            music.pause();
            music.currentTime = 0;
            setPlaying(false);
        }
    }

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(bulbCss(channels, scale, bloom, format));
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch {
            toast.error('Your browser blocked clipboard access.');
        }
    }

    function setChannel(index: 0 | 1 | 2, value: number) {
        setChannels((current) => {
            const next: Channels = [...current];
            next[index] = value;
            return next;
        });
    }

    return (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
            {/* Sized by the viewport height on desktop so the whole editor fits without scrolling. */}
            <div className="relative mt-5 w-[min(20rem,100%)] lg:w-[min(20rem,34svh)] lg:min-w-44">
                <h2 className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-white bg-canvas px-2 py-1 text-xl whitespace-nowrap">
                    Monitor
                </h2>
                <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border border-white bg-canvas">
                    <LightBulb color={hex} scale={scale} bloomIntensity={bloom} />
                </div>
            </div>

            <table className="w-full border-separate border-spacing-x-2 border-spacing-y-1.5">
                <tbody>
                    <SliderRow name="SCALE" min={1} max={10} value={scale} onChange={setScale} />
                    <SliderRow
                        name="RED"
                        min={0}
                        max={255}
                        value={channels[0]}
                        onChange={(value) => setChannel(0, value)}
                    />
                    <SliderRow
                        name="GREEN"
                        min={0}
                        max={255}
                        value={channels[1]}
                        onChange={(value) => setChannel(1, value)}
                    />
                    <SliderRow
                        name="BLUE"
                        min={0}
                        max={255}
                        value={channels[2]}
                        onChange={(value) => setChannel(2, value)}
                    />
                    <SliderRow name="BLOOM" min={0} max={1} step={0.1} value={bloom} onChange={setBloom} />
                </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <input
                    type="color"
                    aria-label="Pick a colour"
                    title="Pick a colour"
                    value={hex}
                    onChange={(event) => {
                        const rgb = hexToRgb(event.target.value);
                        if (rgb) setChannels([...rgb]);
                    }}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white bg-transparent p-1"
                />
                <div className="flex">
                    <button
                        type="button"
                        onClick={copyCss}
                        className="flex items-center gap-2 rounded-l-lg border border-white px-3 py-2 text-lg transition-colors hover:bg-white/10"
                    >
                        {copied ? 'COPIED' : 'COPY'} <Icon icon={copied ? faClipboardCheck : faClipboard} />
                    </button>
                    <button
                        type="button"
                        aria-label={`CSS colour format: ${COLOR_FORMAT_LABEL[format]}. Click to change.`}
                        onClick={() =>
                            setFormat(
                                FORMATS[(FORMATS.indexOf(format) + 1) % FORMATS.length] ?? ColorFormat.Hex,
                            )
                        }
                        className="w-16 rounded-r-lg border border-l-0 border-white bg-white text-lg font-bold text-black"
                    >
                        {COLOR_FORMAT_LABEL[format]}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={toggleMusic}
                    aria-label={playing ? 'Stop music' : 'Play music and animate the colour'}
                    aria-pressed={playing}
                    className="grid size-10 place-items-center rounded-full bg-white text-black transition-transform hover:scale-110"
                >
                    <Icon icon={playing ? faPause : faPlay} />
                </button>
            </div>
        </div>
    );
}
