import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';

const fusionPixel12px: NextFont = localFont({
    src: './../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function ConsolePage() {
    return (
        <div className={fusionPixel12px.className} style={{
            minHeight: '100svh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            Hello World!!!
        </div>
    );
}