import type { Route } from 'next';

export interface NavItem {
    href: Route;
    label: string;
    description: string;
}

/** The component playground pages listed under "Components" in the navbar. */
export const COMPONENT_PAGES: readonly NavItem[] = [
    { href: '/components/apps', label: '<Lightbulb/>', description: 'Glow, bloom and a colour lab.' },
    { href: '/components/image', label: '<Image2Base64/>', description: 'Turn any image into a data URL.' },
    { href: '/components/switch', label: '<Switch/>', description: 'Animated and instant toggles.' },
    {
        href: '/components/dropdown',
        label: '<Dropdown/>',
        description: 'Sliding single and multi-select menus.',
    },
    { href: '/components/shapes', label: '<Shapes/>', description: 'Pure-CSS triangle, arrow and circle.' },
];
