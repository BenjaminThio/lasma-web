import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';

const determinationFont: NextFont = localFont({
    src: './../public/fonts/Mars_Needs_Cunnilingus.ttf'
});

const fusionPixel12px: NextFont = localFont({
    src: './../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function MainPage() {
    return (
        <div className={fusionPixel12px.className} style={{height: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex'}}>
                <span style={{fontSize: 'xx-large'}}>
                    Add a Leaderboard to your game.
                </span>
                <div style={{flexGrow: 1, width: '0.3rem', backgroundColor: 'white'}} className={styles.cursor}/>
            </div>
        </div>
    );
}