'use client';
import { type JSX } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { sleep } from '@/utils/time';
import Footer from './components/footer/footer';
import EditorCard from './components/code-editor/editor-card';
import Tilt from 'react-parallax-tilt';

const fusionPixel12px: NextFont = localFont({
    src: './../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

const title: string = 'Add a Leaderboard to your game.';

export default function MainPage() {
    const [text, setText] = useState<Array<JSX.Element>>([
        <span style={{
            width: '0.3rem',
            backgroundColor: 'white'
        }} className={styles.cursor} key={0}/>
    ]);

    useEffect(() => {
        async function AddLetterToText() {
            for (let i: number = 0; i < title.length; i++) {
                setText(prev => {
                    const newText: Array<JSX.Element> = [...prev];

                    newText.splice(i, 0,
                    <span style={{fontSize: 'xx-large', whiteSpace: 'pre'}} key={i + 1}>
                        { title.charAt(i) }
                    </span>);

                    return newText;
                });

                await sleep(50);
            }
        }

        AddLetterToText();
    }, []);

    return (
        <div style={{overflow: 'hidden'}}>
        <Tilt tiltMaxAngleX={1} tiltMaxAngleY={1} className={fusionPixel12px.className} style={{
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '21.5rem',
            // backgroundColor: 'cyan'
        }}>
            <div style={{
                marginTop: '20rem',
                display: 'flex',
                minHeight: '32px',
                flexWrap: 'wrap'
            }}>
                {text}
            </div>
            <EditorCard/>
        </Tilt>
        <Footer/>
        </div>
    );
}