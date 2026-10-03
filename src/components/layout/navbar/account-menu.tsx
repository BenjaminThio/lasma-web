'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { faXmark } from '@/components/ui/icons';
import { galaxyImage as galaxy } from '@/config/assets';
import { useDismiss } from '@/hooks/use-dismiss';
import type { SessionUser } from '@/lib/domain';
import { LogOutButton } from './log-out-button';

interface AccountMenuProps {
    user: SessionUser;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const MENU_ID = 'account-menu';
const actionClasses =
    'block w-full grow bg-raised p-3 text-center text-lg text-white transition-[scale,border-radius,background-color] duration-500 hover:scale-[1.03] hover:rounded-xl hover:bg-raised-hover disabled:opacity-60';

export function AccountMenu({ user, open, onToggle, onClose }: AccountMenuProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useDismiss(open, onClose, [triggerRef, panelRef]);

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={MENU_ID}
                onClick={onToggle}
                className="block rounded-full transition-transform duration-300 hover:scale-105"
            >
                <Avatar src={user.avatarUrl} size={37} priority className="size-[2.3rem]" />
            </button>

            {open ? (
                <div
                    ref={panelRef}
                    id={MENU_ID}
                    className="absolute top-[calc(100%+1.1rem)] right-0 flex w-60 origin-top-right animate-panel-in flex-col items-center gap-3 rounded-2xl border-3 border-canvas bg-surface p-3 shadow-float"
                >
                    <div className="flex w-full flex-col overflow-hidden rounded-xl">
                        <p className="truncate bg-raised px-3 py-3 text-center text-lg" title={user.email}>
                            {user.email}
                        </p>
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt=""
                                width={228}
                                height={192}
                                unoptimized
                                className="aspect-[76/64] h-auto w-full object-cover"
                                draggable={false}
                            />
                        ) : (
                            <Image
                                src={galaxy}
                                alt=""
                                className="aspect-[76/64] h-auto w-full object-cover pixelated"
                                draggable={false}
                            />
                        )}
                        <p className="truncate bg-raised px-3 py-3 text-center text-lg" title={user.username}>
                            {user.username}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-1">
                        <Link href="/account" onClick={onClose} className={`${actionClasses} rounded-t-xl`}>
                            Edit
                        </Link>
                        <LogOutButton className={`${actionClasses} rounded-b-xl`} />
                    </div>
                    <button
                        type="button"
                        aria-label="Close account menu"
                        onClick={onClose}
                        className="absolute -top-[3px] -right-[3px] grid size-8 place-items-center rounded-[0_1rem_0_1rem] bg-line p-1 transition-[padding] duration-500 hover:pt-2 hover:pr-2"
                    >
                        <Icon icon={faXmark} className="text-xl" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
