export type SocialNetwork = 'instagram' | 'facebook' | 'github';

export const siteConfig = {
    name: 'LASMA Studio',
    shortName: 'LASMA',
    title: 'Add a Leaderboard to your game.',
    description:
        'Hosted leaderboards for indie games. Create an app, copy its keys, and post scores from Godot, Unity, the browser, or anything that speaks HTTP.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    author: 'Benjamin Thio',
    foundedYear: 2025,
    /** Set a URL to turn the footer icon into a link. */
    social: {
        instagram: null,
        facebook: null,
        github: null,
    } satisfies Record<SocialNetwork, string | null>,
    buyMeACoffee: null as string | null,
} as const;
