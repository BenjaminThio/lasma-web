'use client';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { sleep } from '@/utils/time';
import Footer from './components/footer/footer';
import EditorCard from './components/code-editor/editor-card';

const fusionPixel12px: NextFont = localFont({
    src: './../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

const title: string = 'Add a Leaderboard to your game.';

export default function MainPage() {
    const [text, setText] = useState<string>('');

    useEffect(() => {
        async function AddLetterToText() {
            let text = '';

            for (let i: number = 0; i < title.length; i++) {
                text += title.charAt(i);
                setText(text);

                await sleep(50);
            }
        }

        AddLetterToText();
    }, []);

    return (
        <>
        <div className={fusionPixel12px.className} style={{
            marginTop: '20rem',
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '21.5rem'
        }}>
            <div style={{
                display: 'flex'
            }}>
                <div style={{
                    fontSize: 'xx-large'
                }}>
                    {text}
                </div>
                <div style={{
                    flexGrow: 1,
                    width: '0.3rem',
                    backgroundColor: 'white'
                }} className={styles.cursor}/>
            </div>
            <EditorCard/>
        </div>
        <Footer/>
        </>
    );
}