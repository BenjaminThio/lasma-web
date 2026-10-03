'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface NavLinkProps {
    href: Route;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
    const pathname = usePathname();
    const active = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'whitespace-nowrap transition-colors hover:text-accent',
                active && 'text-accent',
                className,
            )}
        >
            {children}
        </Link>
    );
}
