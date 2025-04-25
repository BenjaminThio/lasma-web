'use client';
import { useState, type JSX } from 'react';
import styles from './switch.module.css';

interface SwitchProps {
    defaultChecked: boolean;
    animated: boolean;
    callback: (checked: boolean) => void;
}

export default function Switch(props: SwitchProps): JSX.Element {
    const [checked, setChecked] = useState<boolean>(props.defaultChecked);

    return (
        props.animated
        ?
        <label className={`${styles['slider-container']} ${styles.morph}`}>
            <input type='checkbox' className={styles['check-box']} checked={checked} onChange={(event) => {
                const isChecked: boolean = event.target.checked;

                setChecked(isChecked);
                props.callback(isChecked);
            }}/>
            <div className={`${styles.slider} ${styles.animated}`}/>
        </label>
        :
        <label className={styles['slider-container']}>
            <input type='checkbox' className={styles['check-box']} checked={checked} onChange={(event) => {
                const isChecked: boolean = event.target.checked;

                setChecked(isChecked);
                props.callback(isChecked);
            }}/>
            <div className={`${styles.slider} ${styles.default}`}/>
        </label>
    );
}