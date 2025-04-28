import type { JSX } from 'react';
import styles from './page.module.css';

export default function StopSyurgaPage(): JSX.Element {
    return (
    <div className={styles['main-container']}>
        <iframe src='stop-syurga/index.html' width='960px' height='600px' style={{border: 'none', borderRadius: '1rem', marginTop: '5rem'}} allowFullScreen/>
    </div>
    );
};