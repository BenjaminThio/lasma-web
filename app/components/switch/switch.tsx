import type { JSX } from 'react';
import styles from './switch.module.css';

interface SwitchProps {
    animated: boolean;
}

export default function Switch(props: SwitchProps): JSX.Element {
    return (
        props.animated
        ?
        <label className={`${styles['slider-container']} ${styles.morph}`}>
            <input type='checkbox' className={styles['check-box']}/>
            <div className={`${styles.slider} ${styles.animated}`}/>
        </label>
        :
        <label className={styles['slider-container']}>
            <input type='checkbox' className={styles['check-box']}/>
            <div className={`${styles.slider} ${styles.default}`}/>
        </label>
    );
}