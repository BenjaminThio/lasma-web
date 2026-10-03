import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { bulbStyle, hexToRgb } from '@/lib/color';
import { cn, hasUtility } from '@/lib/cn';
import {
    APP_STATUS_META,
    APP_STATUSES,
    PLATFORM_LABEL,
    PLATFORMS,
    type AppStatus,
    type Platform,
    type Platforms,
} from '@/lib/domain';
import { Icon } from './icon';
import { faAndroid, faApple, faLinux, faWindows } from './icons';

export const PLATFORM_ICONS: Record<Platform, IconDefinition> = {
    windows: faWindows,
    linux: faLinux,
    macOs: faApple,
    android: faAndroid,
};

interface LightBulbProps {
    /** Hex colour of a lit bulb; `null` renders it unlit. */
    color: string | null;
    scale?: number;
    bloomIntensity?: number;
    className?: string;
}

/** The glowing bulb from the original design: base colour, bright inner halo, soft outer bloom. */
export function LightBulb({ color, scale = 1, bloomIntensity = 1, className }: LightBulbProps) {
    const rgb = color ? hexToRgb(color) : null;

    return (
        <span
            aria-hidden
            className={cn('inline-block aspect-square shrink-0 rounded-full', className)}
            style={bulbStyle(rgb, scale, bloomIntensity)}
        />
    );
}

interface TrafficLightProps {
    status: AppStatus;
    scale?: number;
    className?: string;
}

export function TrafficLight({ status, scale = 1, className }: TrafficLightProps) {
    return (
        <span
            role="img"
            aria-label={`Status: ${APP_STATUS_META[status].label}`}
            className={cn('flex items-center', !hasUtility(className, /^gap-/) && 'gap-2', className)}
        >
            {APP_STATUSES.map((value) => (
                <LightBulb
                    key={value}
                    color={value === status ? APP_STATUS_META[value].color : null}
                    scale={scale}
                />
            ))}
        </span>
    );
}

interface PlatformBadgeProps {
    platforms: Platforms;
    /** `solid` for the card overlay, `soft` for use inside text. */
    tone?: 'solid' | 'soft';
    className?: string;
}

export function PlatformBadge({ platforms, tone = 'solid', className }: PlatformBadgeProps) {
    const supported = PLATFORMS.filter((platform) => platforms[platform]);
    if (supported.length === 0) return null;

    return (
        <span
            className={cn(
                'flex items-center gap-2 rounded-[0.3rem] border p-[0.3rem]',
                tone === 'solid' ? 'border-white leading-none' : 'border-white/40 text-sm',
                className,
            )}
        >
            {supported.map((platform) => (
                <Icon key={platform} icon={PLATFORM_ICONS[platform]} title={PLATFORM_LABEL[platform]} />
            ))}
        </span>
    );
}
