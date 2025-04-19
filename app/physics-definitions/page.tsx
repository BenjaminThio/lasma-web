import type { JSX } from 'react';
import styles from './page.module.css';

export default function PhysicsDefinitionsPage(): JSX.Element {
    return (
    <div className={styles['main-container']}>
        <iframe src='physics-definitions/index.html' width='960px' height='600px' style={{border: 'none', borderRadius: '1rem'}} allowFullScreen>
        </iframe>
    </div>
    );
};