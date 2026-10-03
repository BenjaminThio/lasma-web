/** Validation limits shared by the UI (input hints) and the server (enforcement). */
export const LIMITS = {
    appName: 20,
    appDescription: 60,
    playerName: 30,
    identifier: 64,
    username: 30,
    email: 254,
    passwordMin: 8,
    passwordMax: 128,
    thumbnailBytes: 512 * 1024,
    thumbnailEdge: 512,
    avatarBytes: 1024 * 1024,
    avatarEdge: 256,
} as const;

/** How many records each surface loads per chunk. */
export const PAGE_SIZE = {
    gallery: 24,
    console: 10,
    leaderboard: 25,
    apiDefault: 50,
    apiMax: 100,
    apiMutationDefault: 10,
} as const;

/** Page-size choices in the console. `0` means "keep loading in chunks of the maximum size". */
export const CONSOLE_PAGE_SIZES = [
    { option: 'Show All', value: 0 },
    { option: '10', value: 10 },
    { option: '50', value: 50 },
    { option: '100', value: 100 },
] as const;

export const WRITE_KEY_HEADER = 'X-Api-Key';
