import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { cn } from '@/lib/cn';

interface IconProps {
    icon: IconDefinition;
    className?: string;
    /** Accessible name. Omit for decorative icons (they are hidden from assistive tech). */
    title?: string;
    /** Fixed 1.25em width so icons of different shapes line up in lists. */
    fixedWidth?: boolean;
}

export function Icon({ icon, className, title, fixedWidth = false }: IconProps) {
    const [width, height, , , pathData] = icon.icon;
    const paths = Array.isArray(pathData) ? pathData : [pathData];

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${width} ${height}`}
            className={cn(
                'inline-block h-[1em] shrink-0 overflow-visible fill-current align-[-0.125em]',
                fixedWidth ? 'w-[1.25em]' : 'w-auto',
                className,
            )}
            role={title ? 'img' : undefined}
            aria-hidden={title ? undefined : true}
            focusable="false"
        >
            {title ? <title>{title}</title> : null}
            {paths.map((d) => (
                <path key={d.slice(0, 24)} d={d} />
            ))}
        </svg>
    );
}
