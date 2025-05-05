'use client';
import { useEffect, useState } from 'react';
import { sleep } from '@/utils/time';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';

const determinationFont: NextFont = localFont({
    src: './../../public/fonts/Monospaced_Mars_Needs_Cunnilingus.ttf'
});

export default function Loading() {
    const [dots, setDots] = useState<string>('');

    useEffect(() => {
        async function GenerateLoadingDots() {
            let renderer: string = '';

            for (let i: number = 0; i < 3; i++) {
                renderer += '.';
                setDots(renderer);

                await sleep(500);
            }

            await GenerateLoadingDots();
        }

        GenerateLoadingDots();
    }, []);

    return (
        <div className={`${determinationFont.className} ${styles.loading}`} style={{
            height: '100svh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 'xx-large'
        }}>
            <div style={{width: '7ch'}}>
                Loading{dots}
            </div>
        </div>
    );
}