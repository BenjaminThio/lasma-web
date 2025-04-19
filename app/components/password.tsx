'use client';
import { type JSX, useState } from 'react';
import styles from './../auth/page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function Password(): JSX.Element {
    const [isPasswordInvisible, setIsPasswordInvisible] = useState<boolean>(true);

    return (
        <div className={styles['input-wrapper']} style={{marginBottom: '0.5rem'}}>
            <input placeholder='Password' className={styles.input} type={isPasswordInvisible ? 'password' : 'text'}/>
            <FontAwesomeIcon icon={isPasswordInvisible ? faEyeSlash : faEye} className={`${'fa-fw'} ${styles.icon}`} onClick={() => setIsPasswordInvisible(!isPasswordInvisible)}/>
        </div>
    );
};