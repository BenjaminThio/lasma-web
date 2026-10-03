'use client';

import Link from 'next/link';
import type { Ref } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { faArrowRight } from '@/components/ui/icons';
import { COMPONENT_PAGES } from '@/config/navigation';
import { cn } from '@/lib/cn';

interface ComponentsMenuProps {
    id: string;
    open: boolean;
    panelRef: Ref<HTMLDivElement>;
    onNavigate: () => void;
}

/** The "Components" mega panel: slides down from behind the navbar, as in the original design. */
export function ComponentsMenu({ id, open, panelRef, onNavigate }: ComponentsMenuProps) {
    return (
        <div className="pointer-events-none absolute inset-x-0 top-full z-10 hidden justify-center overflow-hidden px-4 pb-10 md:flex">
            <div
                ref={panelRef}
                id={id}
                inert={!open}
                className={cn(
                    'pointer-events-auto flex w-[40rem] max-w-full overflow-hidden rounded-b-lg shadow-float',
                    'transition-[translate,opacity] duration-300 ease-out-quint',
                    open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
                )}
            >
                <div className="flex w-1/2 flex-col justify-center gap-6 bg-black p-8">
                    <p className="text-3xl font-bold text-accent">Components</p>
                    <p className="text-base leading-relaxed">
                        Look how we created our own custom components, while testing them in each separated
                        page.
                    </p>
                    <Link
                        href={COMPONENT_PAGES[0]?.href ?? '/components/apps'}
                        onClick={onNavigate}
                        className={buttonClasses({
                            variant: 'outline',
                            size: 'sm',
                            className: 'w-fit rounded-2xl',
                        })}
                    >
                        Explore <Icon icon={faArrowRight} />
                    </Link>
                </div>
                <div className="flex grow flex-col gap-5 bg-panel p-8">
                    <p className="text-lg font-bold">Pages</p>
                    <ul className="flex grow flex-col justify-between gap-3">
                        {COMPONENT_PAGES.map((page) => (
                            <li key={page.href}>
                                <Link
                                    href={page.href}
                                    onClick={onNavigate}
                                    className="group flex flex-col rounded-md transition-colors hover:text-accent"
                                >
                                    <span>{page.label}</span>
                                    <span className="font-pixel-sm text-xs text-subtle transition-colors group-hover:text-muted">
                                        {page.description}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
