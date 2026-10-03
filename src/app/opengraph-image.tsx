import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { faAtom } from '@fortawesome/free-solid-svg-icons/faAtom';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const alt = `${siteConfig.name}: ${siteConfig.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// A 7 KB Latin subset of Fusion Pixel (the site's own font), read once at build time.
const pixelFont = readFile(join(process.cwd(), 'src/app/_assets/fusion-pixel-latin.otf'));

const ROWS = [
    { rank: '1.', name: 'Benjamin Thio', score: '999', color: '#ffd200' },
    { rank: '2.', name: 'Teh Yi Fan', score: '980', color: '#c9ced6' },
    { rank: '3.', name: 'Loh Zen Thye', score: '975', color: '#d8894a' },
];

export default async function OpenGraphImage() {
    const [width, height, , , path] = faAtom.icon;

    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '64px 72px',
                background: 'radial-gradient(circle at 80% 20%, #2a2410 0%, #131314 55%)',
                color: '#ffffff',
                fontFamily: 'Fusion Pixel',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34 }}>
                <svg width="44" height="44" viewBox={`0 0 ${width} ${height}`} fill="#ffd200">
                    <path d={Array.isArray(path) ? path.join(' ') : path} />
                </svg>
                LASMA STUDIO
            </div>

            <div
                style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48 }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 620 }}>
                    <div style={{ fontSize: 72, lineHeight: 1.1 }}>{siteConfig.title}</div>
                    <div style={{ fontSize: 28, lineHeight: 1.4, color: '#a1a3a8' }}>
                        Hosted leaderboards for indie games. One HTTP request from Godot, Unity or the web.
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        width: 400,
                        padding: 14,
                        borderRadius: 20,
                        background: '#1b1b1b',
                        border: '2px solid #2a2c2e',
                    }}
                >
                    {ROWS.map((row) => (
                        <div
                            key={row.rank}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 18,
                                height: 64,
                                padding: '0 20px',
                                borderRadius: 12,
                                background: '#282a2c',
                                fontSize: 28,
                            }}
                        >
                            <span style={{ color: row.color }}>{row.rank}</span>
                            <span style={{ flexGrow: 1 }}>{row.name}</span>
                            <span>{row.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        {
            ...size,
            fonts: [{ name: 'Fusion Pixel', data: await pixelFont, style: 'normal', weight: 400 }],
        },
    );
}
