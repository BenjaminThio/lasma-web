import type { JSX } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './apps.module.css';
import Image from 'next/image';
import TrafficLight from './traffic-light';
import { PlatformsProps, Status, Tag } from '@/utils/firestore';
import Platform from './platform';

interface AppCardProps {
    thumnail: string;
    name: string;
    description: string;
    status: Status;
    platforms: PlatformsProps;
    tag: Tag;
}

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

const fusionPixel10px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-10px-monospaced-zh_hans.otf'
});

export default function AppCard({thumnail, name, description, status, platforms, tag}: AppCardProps): JSX.Element {
    return (
    <div className={styles['app-card']}>
        <div className={styles['app-container-upper-component']}>
            <div className={styles['app-image-container']}>
                <Image src={thumnail} width={0} height={0} sizes='100dvw' draggable={false} className={styles['app-image']} alt='placeholder' unoptimized/>
                <TrafficLight status={status}/>
                <Platform windows={platforms.windows} linux={platforms.linux} macOs={platforms.macOs} android={platforms.android}/>
            </div>
            <div className={`${fusionPixel12px.className} ${styles['app-title-container']}`}>
                {name}
            </div>
        </div>
        <div className={`${fusionPixel12px.className} ${styles['tag-container']}`}>
            {Tag[tag].toUpperCase()}
        </div>
        <div className={`${fusionPixel10px.className} ${styles['description-container']}`}>
            <span>
                *
            </span>
            <span className={`${fusionPixel10px.className}`} style={{wordBreak: 'break-all'}}>
                {description}
            </span>
        </div>
    </div>
    );
}