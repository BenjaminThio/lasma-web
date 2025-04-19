import { JSX } from 'react';
import styles from './switch.module.css';
import Switch from './switch';

export default function SwitchPage(): JSX.Element {
    return (
        <div className={styles['main-container']}>
            <Switch animated/>
            <Switch animated={false}/>
        </div>
    );
}