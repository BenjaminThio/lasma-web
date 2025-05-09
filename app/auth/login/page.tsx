'use client';
import  {type JSX, useState } from 'react';
import styles from './../auth.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import PasswordInputField from './../../components/password';
import Tilt from 'react-parallax-tilt';
import { type Email } from '@/utils/firestore';
import { Login } from './../auth-client';
import Link from 'next/link';

export default function AuthPage(): JSX.Element {
    const [email, setEmail] = useState<Email>('' as Email);
    //const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

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
                    <input placeholder='Email' className={styles.input}
                    onChange={(event) => {
                        setEmail(event.target.value as Email);
                    }}/>
                    <FontAwesomeIcon icon={faEnvelope}/>
                </div>
                <PasswordInputField callback={(value: string) => {setPassword(value);}}/>
                <div className={styles['extra-options-container']}>
                    <label>
                        <input type='checkbox'/>
                        remember me
                    </label>
                    <div className={styles.underline}>
                        forgot password?
                    </div>
                </div>
                <button className={`${styles['login-button']} ${styles['default']}`}
                onClick={async () => {
                    await Login(email, password);
                }}>
                    Login
                </button>
                <button className={`${styles['login-button']} ${styles['google']}`} style={{marginBottom: '2rem'}}>
                    <FontAwesomeIcon icon={faGoogle} style={{marginRight: '1rem'}}/>
                    Sign in with Google
                </button>
                <div>
                    {`Don't have a account? `}
                    <Link href={'/auth/sign-up'} style={{color: 'rgb(6, 35, 50)'}}>
                        Register one.
                    </Link>
                </div>
            </Tilt>
        </div>
    );
};