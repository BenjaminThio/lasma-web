import { faAtom } from '@fortawesome/free-solid-svg-icons/faAtom';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Home-screen icon for iOS: the navbar atom on the site's canvas colour (iOS rounds the corners). */
export default function AppleIcon() {
    const [width, height, , , path] = faAtom.icon;

    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#131314',
            }}
        >
            <svg width="112" height="128" viewBox={`0 0 ${width} ${height}`} fill="#ffd200">
                <path d={Array.isArray(path) ? path.join(' ') : path} />
            </svg>
        </div>,
        size,
    );
}
