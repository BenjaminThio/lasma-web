'use client';

import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useDismiss } from '@/hooks/use-dismiss';
import { cn, hasUtility } from '@/lib/cn';
import { Icon } from './icon';
import { faPencil } from './icons';

export interface DropdownOption<T extends string | number> {
    option: ReactNode;
    value: T;
    /** Accessible name when `option` isn't plain text (e.g. an icon). */
    title?: string;
}

export interface DropdownTheme {
    color?: string;
    background?: string;
    hover?: string;
    selected?: string;
    /** CSS border shorthand, e.g. `1px solid purple`. */
    border?: string;
    radius?: string;
    padding?: string;
}

const DEFAULT_THEME: Required<DropdownTheme> = {
    color: '#000000',
    background: '#ffffff',
    hover: '#87cefa',
    selected: '#90ee90',
    border: 'none',
    radius: '0.5rem',
    padding: '0.5rem',
};

interface BaseProps<T extends string | number> {
    /** Accessible name of the trigger button. */
    label: string;
    options: readonly DropdownOption<T>[];
    direction?: 'vertical' | 'horizontal';
    theme?: DropdownTheme;
    className?: string;
    disabled?: boolean;
}

interface SingleProps<T extends string | number> extends BaseProps<T> {
    multiple?: false;
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
}

interface MultipleProps<T extends string | number> extends BaseProps<T> {
    multiple: true;
    value?: readonly T[];
    defaultValue?: readonly T[];
    onChange?: (values: T[]) => void;
    /** Trigger content for multi-select (defaults to a pencil, like the original). */
    trigger?: ReactNode;
}

export type DropdownProps<T extends string | number> = SingleProps<T> | MultipleProps<T>;

interface ParsedBorder {
    width: string;
    style: string;
    color: string;
}

/** Splits `1px solid purple` into long-hand parts (React warns when shorthand and long-hand mix). */
function parseBorder(border: string): ParsedBorder | null {
    const [width, style, ...color] = border.trim().split(/\s+/);
    if (border === 'none' || !width || !style || color.length === 0) return null;
    return { width, style, color: color.join(' ') };
}

const ARROW_ROTATION = {
    vertical: { open: '-rotate-135', closed: 'rotate-45' },
    horizontal: { open: 'rotate-135', closed: '-rotate-45' },
} as const;

/**
 * The original sliding dropdown: options tuck behind the trigger and slide out below it (vertical)
 * or beside it (horizontal). Supports single and multi-select, closes on outside click / Escape.
 */
export function Dropdown<T extends string | number>(props: DropdownProps<T>) {
    const { label, options, direction = 'vertical', className, disabled = false } = props;
    const theme = { ...DEFAULT_THEME, ...props.theme };
    const isVertical = direction === 'vertical';
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [singleValue, setSingleValue] = useState<T | undefined>(
        props.multiple ? undefined : (props.defaultValue ?? options[0]?.value),
    );
    const [multipleValues, setMultipleValues] = useState<readonly T[]>(
        props.multiple ? (props.defaultValue ?? []) : [],
    );

    useDismiss(open, () => setOpen(false), [rootRef]);

    const selected: readonly T[] = props.multiple
        ? (props.value ?? multipleValues)
        : [props.value ?? singleValue].filter((value): value is T => value !== undefined);
    const current = options.find((option) => option.value === selected[0]);
    const border = parseBorder(theme.border);

    function choose(value: T) {
        if (props.multiple) {
            const next = selected.includes(value)
                ? selected.filter((item) => item !== value)
                : [...selected, value];
            if (props.value === undefined) setMultipleValues(next);
            props.onChange?.(next);
            return;
        }

        if (props.value === undefined) setSingleValue(value);
        props.onChange?.(value);
        setOpen(false);
    }

    const cssVariables = {
        '--dd-bg': theme.background,
        '--dd-hover': theme.hover,
        '--dd-selected': theme.selected,
        color: theme.color,
    } as CSSProperties;

    return (
        <div
            ref={rootRef}
            className={cn(
                'relative w-fit',
                // A caller's text size brings its own line height.
                !hasUtility(className, /^text-(xs|sm|base|lg|\d?xl|\[\d)/) && 'leading-[1.2]',
                className,
            )}
            style={cssVariables}
        >
            <button
                type="button"
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                disabled={disabled}
                onClick={() => setOpen((previous) => !previous)}
                className="relative z-10 flex items-center gap-2 bg-(--dd-bg) transition-[border-radius] duration-200 disabled:opacity-50"
                style={{
                    padding: theme.padding,
                    borderRadius: !isVertical && open ? `${theme.radius} 0 0 ${theme.radius}` : theme.radius,
                    ...(border
                        ? {
                              borderWidth: border.width,
                              borderStyle: border.style,
                              // Horizontal menus open to the right: drop the seam between trigger and options.
                              borderColor:
                                  !isVertical && open
                                      ? `${border.color} transparent ${border.color} ${border.color}`
                                      : border.color,
                          }
                        : {}),
                }}
            >
                {props.multiple ? (
                    (props.trigger ?? <Icon icon={faPencil} fixedWidth />)
                ) : (
                    // Stack every option invisibly so the trigger is as wide as the longest one.
                    <span className="grid text-left">
                        {options.map((option) => (
                            <span
                                key={option.value}
                                aria-hidden
                                className="invisible col-start-1 row-start-1 whitespace-nowrap"
                            >
                                {option.option}
                            </span>
                        ))}
                        <span className="col-start-1 row-start-1 whitespace-nowrap">{current?.option}</span>
                    </span>
                )}
                <span
                    aria-hidden
                    className={cn(
                        'm-[0.2rem] size-[0.45em] border-r-2 border-b-2 border-current transition-transform duration-200',
                        open ? ARROW_ROTATION[direction].open : ARROW_ROTATION[direction].closed,
                    )}
                />
            </button>

            <div
                id={listId}
                role="listbox"
                aria-label={label}
                aria-multiselectable={props.multiple || undefined}
                inert={!open}
                className={cn(
                    'absolute',
                    isVertical
                        ? 'top-full left-1/2 flex w-[92%] -translate-x-1/2 flex-col'
                        : 'top-0 left-full grid h-full w-max auto-cols-fr grid-flow-col',
                )}
            >
                {options.map((option, index) => {
                    const isSelected = selected.includes(option.value);
                    const isLast = index === options.length - 1;
                    const offset = `calc(-100% * ${index + 1})`;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            title={option.title}
                            aria-label={option.title}
                            tabIndex={open ? 0 : -1}
                            onClick={() => choose(option.value)}
                            className={cn(
                                'flex items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap',
                                'bg-(--dd-bg) transition-[translate,opacity,background-color] duration-200 hover:bg-(--dd-hover) aria-selected:bg-(--dd-selected)',
                                open ? 'opacity-100' : 'pointer-events-none opacity-0',
                            )}
                            style={{
                                padding: theme.padding,
                                translate: open ? '0 0' : isVertical ? `0 ${offset}` : `${offset} 0`,
                                ...(border
                                    ? {
                                          borderStyle: border.style,
                                          borderColor: border.color,
                                          borderWidth: isVertical
                                              ? `0 ${border.width} ${border.width} ${border.width}`
                                              : `${border.width} ${isLast ? border.width : '0'} ${border.width} 0`,
                                      }
                                    : {}),
                                ...(isLast
                                    ? {
                                          borderRadius: isVertical
                                              ? `0 0 ${theme.radius} ${theme.radius}`
                                              : `0 ${theme.radius} ${theme.radius} 0`,
                                      }
                                    : {}),
                            }}
                        >
                            {option.option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
