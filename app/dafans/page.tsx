import type { JSX } from 'react';
import styles from './page.module.css';


export default function DafansPage(): JSX.Element {
    return (
    <div className={styles['main-container']}>
        <iframe src='dafans/index.html' width='960px' height='600px' style={{border: 'none', borderRadius: '1rem'}} allowFullScreen>
        </iframe>
    </div>
    );
};