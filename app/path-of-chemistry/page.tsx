import type { JSX } from 'react';
import styles from './page.module.css';

export default function PathOfChemistryPage(): JSX.Element {
    return (
    <div className={styles['main-container']}>
        <iframe src='path-of-chemistry/index.html' width='960px' height='600px' style={{border: 'none', borderRadius: '1rem', marginTop: '5rem'}} allowFullScreen/>
    </div>
    );
};