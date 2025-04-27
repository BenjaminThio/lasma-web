import type { JSX } from 'react';
import styles from './page.module.css';
import Fan from './../../app/components/fan';
import { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';

const determinationFont: NextFont = localFont({
    src: './../../public/fonts/Mars_Needs_Cunnilingus.ttf'
});

export default function Home(): JSX.Element {
    return (
    <main className={`${styles.background} ${determinationFont.className}`}>
        <h1>POP YI FAN</h1>
        <Fan/>
    </main>
    );
}