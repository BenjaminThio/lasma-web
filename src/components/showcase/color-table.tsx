'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import { LoadingDots } from '@/components/ui/primitives';

export interface ColorRow {
    keyword: string;
    rgb: string;
    hex: string;
    hsl: string;
}

export interface ColorGroup {
    title: string;
    rows: ColorRow[];
}

const CHUNK = 40;
const chip = 'inline-block max-w-full truncate rounded-lg bg-[rgb(60,60,60)] px-1.5 py-0.5 align-middle';

/*
 * Columns appear as the table's own width allows (container queries, not the viewport), so the
 * swatch column is always visible: Keyword · Hex · Colour, then HSL from 36rem, then RGB from 48rem.
 */
const rowGrid =
    'grid grid-cols-[minmax(0,1fr)_5rem_3.5rem] items-center gap-x-2 @xl:grid-cols-[minmax(0,1fr)_5rem_minmax(0,11rem)_4.5rem] @3xl:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_5rem_minmax(0,11rem)_4.5rem]';
const rgbCell = 'hidden @3xl:block';
const hslCell = 'hidden @xl:block';

/** The named-colour reference, rendered in chunks as you scroll instead of all 140+ rows at once. */
export function ColorTable({ groups }: { groups: ColorGroup[] }) {
    // Index of each group's first row in the flattened list.
    const offsets: number[] = [];
    let total = 0;
    for (const group of groups) {
        offsets.push(total);
        total += group.rows.length;
    }

    const [visible, setVisible] = useState(CHUNK);

    const sentinelRef = useCallback(
        (node: HTMLElement | null) => {
            if (!node || visible >= total) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        setVisible((count) => Math.min(total, count + CHUNK));
                    }
                },
                { rootMargin: '600px 0px' },
            );
            observer.observe(node);
            return () => observer.disconnect();
        },
        [visible, total],
    );

    return (
        <div className="@container w-full">
            {groups.map((group, groupIndex) => {
                const rows = group.rows.slice(0, Math.max(0, visible - (offsets[groupIndex] ?? 0)));
                if (rows.length === 0) return null;

                const headingId = `colors-${group.title.toLowerCase().replace(/\W+/g, '-')}`;

                return (
                    <section key={group.title} aria-labelledby={headingId} className="mb-6">
                        <h3 id={headingId} className="pt-6 pb-3 text-center text-3xl">
                            {group.title}
                        </h3>
                        <div role="table" aria-labelledby={headingId} className="flex flex-col gap-1">
                            <div role="rowgroup">
                                <div role="row" className={`${rowGrid} px-2 pb-1 text-lg`}>
                                    <span role="columnheader">Keyword</span>
                                    <span role="columnheader" className={rgbCell}>
                                        RGB
                                    </span>
                                    <span role="columnheader">Hex</span>
                                    <span role="columnheader" className={hslCell}>
                                        HSL
                                    </span>
                                    <span role="columnheader" className="text-center">
                                        Color
                                    </span>
                                </div>
                            </div>
                            <div role="rowgroup" className="flex flex-col gap-1">
                                {rows.map((row) => (
                                    <div
                                        role="row"
                                        key={row.keyword}
                                        className={`${rowGrid} animate-fade-in rounded-lg px-2 py-1 text-base transition-colors hover:bg-white/[0.03]`}
                                    >
                                        <span role="cell" className="min-w-0">
                                            <span className={chip} title={row.keyword}>
                                                {row.keyword}
                                            </span>
                                        </span>
                                        <span role="cell" className={`${rgbCell} min-w-0`}>
                                            <span className={`${chip} whitespace-nowrap`}>{row.rgb}</span>
                                        </span>
                                        <span role="cell" className="min-w-0">
                                            <span className={`${chip} select-text`}>{row.hex}</span>
                                        </span>
                                        <span role="cell" className={`${hslCell} min-w-0`}>
                                            <span className={`${chip} whitespace-nowrap`}>{row.hsl}</span>
                                        </span>
                                        <span role="cell" className="flex justify-center">
                                            <span
                                                aria-label={`${row.keyword} swatch`}
                                                role="img"
                                                className="block h-9 w-full max-w-16 rounded-lg ring-1 ring-white/10 ring-inset @xl:h-10"
                                                style={{ backgroundColor: row.keyword } as CSSProperties}
                                            />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            })}
            {visible < total ? (
                <div ref={sentinelRef} className="py-6 text-center text-muted">
                    Loading colours
                    <LoadingDots />
                </div>
            ) : null}
        </div>
    );
}
