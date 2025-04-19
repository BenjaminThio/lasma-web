'use client';
import { type JSX, useState } from 'react';
import styles from './fan.module.css';

export default function Fan(): JSX.Element {
    const [counter, setCounter] = useState<number>(0);
  
    function Pop(): void {
        setCounter(counter + 1);
        PlayAudio();
    };
  
    function PlayAudio(): void {
        new Audio('/sounds/pop.ogg').play();
    };

    return (
    <>
        <div className={styles.fan} onClick={Pop}></div>
        <h1>{counter}</h1>
    </>
    );
}