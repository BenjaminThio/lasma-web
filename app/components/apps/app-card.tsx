import type { JSX } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './apps.module.css';
import Image from 'next/image';
import placeholder from './../../../public/images/galaxy.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import TrafficLight from './traffic-light';
import { Status } from '@/utils/firestore';

interface AppCardProps {
    name: string;
    description: string;
    status: Status;
    scale?: number;
}

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

const fusionPixel10px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-10px-monospaced-zh_hans.otf'
});

export default function AppCard({name, description, status, scale = 1}: AppCardProps): JSX.Element {
    return (
    <div className={styles['app-card']} style={{scale: scale}}>
        <div className={styles['app-container-upper-component']}>
            <div className={styles['app-image-container']}>
                <Image src={placeholder} width={0} height={0} sizes='100dvw' draggable={false} className={styles['app-image']} alt='placeholder' unoptimized/>
                <TrafficLight status={status}/>
                <div className={`${fusionPixel10px.className} ${styles['platform-container']}`}>
                    <FontAwesomeIcon icon={faWindows}/>
                </div>
            </div>
            <div className={`${fusionPixel12px.className} ${styles['app-title-container']}`}>
                {name}
            </div>
        </div>
        <div className={`${fusionPixel12px.className} ${styles['tag-container']}`}>
            FREE
        </div>
        <div className={`${fusionPixel10px.className} ${styles['description-container']}`}>
            <span>
                *
            </span>
            <span>
                {description}
            </span>
        </div>
    </div>
    );
}