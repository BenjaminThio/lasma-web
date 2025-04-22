import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';

const determinationFont: NextFont = localFont({
    src: './../public/fonts/Mars_Needs_Cunnilingus.ttf'
});

const fusionPixel12px: NextFont = localFont({
    src: './../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function MainPage() {
    return (
        <div className={fusionPixel12px.className} style={{height: '100svh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <h1>
                Add a Leaderboard to your game.
            </h1>
        </div>
    );
}