export type GameSlug = 'dafans' | 'stop-syurga' | 'path-of-chemistry' | 'physics-definitions';

export interface Game {
    slug: GameSlug;
    title: string;
    engine: 'Godot' | 'Unity';
    /** Static export served from `public/`. */
    embedSrc: string;
    icon: string;
    /** `cover` for artwork that should fill the tile, `contain` for icons. */
    iconFit: 'contain' | 'cover';
    /** Approximate first-load download, so mobile players know what they're in for. */
    downloadMb: number;
    /** Threaded Godot exports need SharedArrayBuffer, i.e. a cross-origin isolated page. */
    requiresIsolation: boolean;
}

export const GAMES: Record<GameSlug, Game> = {
    dafans: {
        slug: 'dafans',
        title: 'Dafans',
        engine: 'Godot',
        embedSrc: '/dafans/index.html',
        icon: '/dafans/GAY-DLE%20Alpha%20v1.0.png',
        iconFit: 'contain',
        downloadMb: 42,
        requiresIsolation: true,
    },
    'stop-syurga': {
        slug: 'stop-syurga',
        title: 'Stop Syurga',
        engine: 'Godot',
        embedSrc: '/stop-syurga/index.html',
        icon: '/stop-syurga/index.png',
        iconFit: 'contain',
        downloadMb: 133,
        requiresIsolation: true,
    },
    'path-of-chemistry': {
        slug: 'path-of-chemistry',
        title: 'Path of Chemistry',
        engine: 'Unity',
        embedSrc: '/path-of-chemistry/index.html',
        icon: '/path-of-chemistry/Build/WebGL.jpg',
        iconFit: 'cover',
        downloadMb: 190,
        requiresIsolation: false,
    },
    'physics-definitions': {
        slug: 'physics-definitions',
        title: 'Physics Definitions Quiz',
        engine: 'Godot',
        embedSrc: '/physics-definitions/index.html',
        icon: '/physics-definitions/STPM%20Physics%20Definitions%20Quiz.png',
        iconFit: 'contain',
        downloadMb: 36,
        requiresIsolation: true,
    },
};

export const GAME_LIST: readonly Game[] = Object.values(GAMES);
