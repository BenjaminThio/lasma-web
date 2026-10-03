import 'server-only';
import { AppStatus, AppTag, type AppInfo } from '@/lib/domain';
import type { AppRecord, PlayerRecord } from '../types';

/** Deterministic PRNG so the demo data is identical on every restart. */
function mulberry32(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const DEMO_OWNER = 'demo@lasma.local';
const FIRST_NAMES = [
    'Aiden',
    'Mei',
    'Hafiz',
    'Priya',
    'Jun',
    'Sofia',
    'Ravi',
    'Hana',
    'Lucas',
    'Nur',
    'Kai',
    'Ivy',
];
const HANDLES = ['Pixel', 'Nova', 'Byte', 'Comet', 'Echo', 'Rune', 'Glitch', 'Orbit', 'Frost', 'Blaze'];
const EPOCH = Date.UTC(2025, 4, 8, 16, 44, 48);

interface SeedApp {
    id: string;
    info: AppInfo;
    isGlobal: boolean;
    players: number;
}

const FEATURED: SeedApp[] = [
    {
        id: 'demo-neon-drift',
        isGlobal: true,
        players: 240,
        info: {
            name: 'Neon Drift',
            description: 'Arcade racer. Beat the clock, top the board.',
            status: AppStatus.Ready,
            tag: AppTag.Web,
            platforms: { windows: true, linux: true, macOs: false, android: false },
        },
    },
    {
        id: 'demo-pixel-golf',
        isGlobal: true,
        players: 12,
        info: {
            name: 'Pixel Golf',
            description: 'Nine holes of chunky pixel putting.',
            status: AppStatus.UnderConstruction,
            tag: AppTag.Free,
            platforms: { windows: false, linux: false, macOs: false, android: true },
        },
    },
    {
        id: 'demo-star-miner',
        isGlobal: true,
        players: 0,
        info: {
            name: 'Star Miner',
            description: 'Dig asteroids, sell ore, repeat.',
            status: AppStatus.Ready,
            tag: AppTag.Paid,
            platforms: { windows: true, linux: false, macOs: true, android: false },
        },
    },
    {
        id: 'demo-quiz-lab',
        isGlobal: true,
        players: 5,
        info: {
            name: 'Quiz Lab',
            description: 'Physics definitions against the timer.',
            status: AppStatus.Disabled,
            tag: AppTag.Web,
            platforms: { windows: true, linux: true, macOs: true, android: true },
        },
    },
];

export interface SeedData {
    apps: AppRecord[];
    players: Map<string, PlayerRecord[]>;
}

export function createSeedData(): SeedData {
    const random = mulberry32(20250508);
    const apps: SeedApp[] = [...FEATURED];

    for (let index = 1; index <= 30; index += 1) {
        const status = (index % 3) as AppStatus;
        apps.push({
            id: `demo-app-${String(index).padStart(2, '0')}`,
            isGlobal: true,
            players: Math.floor(random() * 40),
            info: {
                name: `Demo App ${String(index).padStart(2, '0')}`,
                description: 'Seeded locally so paging has something to page.',
                status,
                tag: (index % 3) as AppTag,
                platforms: {
                    windows: random() > 0.3,
                    linux: random() > 0.6,
                    macOs: random() > 0.6,
                    android: random() > 0.5,
                },
            },
        });
    }

    const players = new Map<string, PlayerRecord[]>();

    for (const app of apps) {
        const list: PlayerRecord[] = [];

        if (app.id === 'demo-neon-drift') {
            list.push(
                {
                    id: '4572ab60-9ee1-43fa-b364-37046a00e5e1',
                    name: 'Benjamin Thio',
                    score: 999,
                    datetime: 'Tue, 28 Oct 2025 07:00:12 GMT',
                },
                {
                    id: 'ba9ebdf3-6378-41d8-89e9-5888129b7296',
                    name: 'Teh Yi Fan',
                    score: 980,
                    datetime: 'Wed, 21 May 2025 15:28:23 GMT',
                },
                {
                    id: 'e17dfa31-77fa-4174-96be-4ed909f603eb',
                    name: 'Loh Zen Thye',
                    score: 975,
                    datetime: 'Thu, 08 May 2025 16:44:48 GMT',
                },
                {
                    id: 'b98bbe22-122c-471f-a1ff-6bbb5f726bab',
                    name: 'Law Choon Hong',
                    score: 960,
                    datetime: 'Thu, 08 May 2025 16:44:51 GMT',
                },
            );
        }

        while (list.length < app.players) {
            const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)] ?? 'Player';
            const handle = HANDLES[Math.floor(random() * HANDLES.length)] ?? 'One';
            list.push({
                id: `${app.id}-p${String(list.length).padStart(4, '0')}`,
                name: `${first} ${handle}${Math.floor(random() * 90) + 10}`,
                score: Math.floor(random() * 950),
                datetime: new Date(EPOCH + Math.floor(random() * 200 * 86_400_000)).toUTCString(),
            });
        }

        players.set(app.id, list);
    }

    return {
        apps: apps.map((app) => ({
            id: app.id,
            ownerId: DEMO_OWNER,
            isGlobal: app.isGlobal,
            info: app.info,
            createdAt: EPOCH,
            thumbnailVersion: 0,
            hasThumbnail: false,
        })),
        players,
    };
}
