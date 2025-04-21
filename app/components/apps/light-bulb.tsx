'use client';
import { JSX } from 'react';
import styles from './apps.module.css';
import { type RGB, ParseRgb, Rgb2Hex, Rgba2Hexa, brightenColor } from '@/utils/color';

interface LightBulbProps {
    color?: string;
    scale?: number;
    bloomIntensity?: number;
    animated?: boolean;
    callback?: () => void;
}

export default function LightBulb({color = '', scale = 1, bloomIntensity = 1.0, animated = false, callback = () => {}}: LightBulbProps): JSX.Element {
    const size: number = 0.5 * scale;
    const rgb: RGB = ParseRgb(color, true) as RGB;

    return (
    <div className={`${styles['light-bulb']} ${animated ? styles.animated : ''}`} style={{
        backgroundColor: Rgb2Hex(rgb),
        height: `${size}rem`,
        boxShadow: `inset 0 0 ${size * 0.24}rem ${size * 0.24}rem ${Rgb2Hex(brightenColor(rgb, 200))}${color === '' ? '' : `, 0 0 ${size}rem ${size / 2}rem ${Rgba2Hexa([...rgb, bloomIntensity])}`}`
    }} onClick={callback}/>
    );
}