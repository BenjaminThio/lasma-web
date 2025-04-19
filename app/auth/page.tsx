'use client';
import type { JSX } from 'react';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import PasswordInputField from './../components/password';
import Tilt from 'react-parallax-tilt';

export default function AuthPage(): JSX.Element {
    return (
        <div className={styles['background']}>
            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} glareEnable={true} glareMaxOpacity={0.2} glareColor='red' glarePosition='all' glareBorderRadius='1rem' className={styles['main-container']}>
                <button className={styles.cancel}>
                    <FontAwesomeIcon icon={faXmark} className={styles['cancel-sign']}/>
                </button>
                <h1 style={{marginBottom: '3rem'}}>
                    Login
                </h1>
                <div className={styles['input-wrapper']} style={{marginBottom: '2rem'}}>
                    <input placeholder='Email' className={styles.input}/>
                    <FontAwesomeIcon icon={faEnvelope}/>
                </div>
                <PasswordInputField/>
                <div className={styles['extra-options-container']}>
                    <label>
                        <input type='checkbox'/>
                        remember me
                    </label>
                    <div className={styles.underline}>
                        forgot password?
                    </div>
                </div>
                <button className={`${styles['login-button']} ${styles['default']}`}>
                    Login
                </button>
                <button className={`${styles['login-button']} ${styles['google']}`} style={{marginBottom: '2rem'}}>
                    <FontAwesomeIcon icon={faGoogle} style={{marginRight: '1rem'}}/>
                    Sign in with Google
                </button>
                <div>
                    {`Don't have a account? `}
                    <span className={styles.underline}>
                        Register one.
                    </span>
                </div>
            </Tilt>
        </div>
    );
};