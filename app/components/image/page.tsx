import { type JSX } from 'react';
import styles from './page.module.css';
import { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import Image2Base64Component from './image-to-base64';

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function ImagePage(): JSX.Element {
    return (
        <div className={`${fusionPixel12px.className} ${styles['main-container']}`}>
            <Image2Base64Component/>
        </div>
    );
}