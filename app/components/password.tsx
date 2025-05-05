'use client';
import { type JSX, useState } from 'react';
import styles from './../auth/auth.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface PasswordProps {
    callback: (value: string) => void;
}

export default function Password({callback}: PasswordProps): JSX.Element {
    const [isPasswordInvisible, setIsPasswordInvisible] = useState<boolean>(true);

    return (
        <div className={styles['input-wrapper']} style={{marginBottom: '0.5rem'}}>
            <input onChange={(event) => {callback(event.target.value);}} placeholder='Password' className={styles.input} type={isPasswordInvisible ? 'password' : 'text'}/>
            <FontAwesomeIcon icon={isPasswordInvisible ? faEyeSlash : faEye} className={`${'fa-fw'} ${styles.icon}`} onClick={() => setIsPasswordInvisible(!isPasswordInvisible)}/>
        </div>
    );
};