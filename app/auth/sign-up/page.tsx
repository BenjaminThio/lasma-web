'use client';
import  {type JSX, useRef } from 'react';
import styles from './../auth.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faEnvelope, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import PasswordInputField from '../../components/password';
import Tilt from 'react-parallax-tilt';
import { AddNewUser, GetAllUserIds, type Email } from '@/utils/firestore';
import { GenerateSalt, GenerateSessionId, SetCookie } from '../auth';
import { redirect } from 'next/navigation';

export default function AuthPage(): JSX.Element {
    const username = useRef<string>('');
    const email = useRef<Email>('' as Email);
    const password = useRef<string>('');

    return (
        <div className={styles['background']}>
            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} glareEnable={true} glareMaxOpacity={0.2} glareColor='red' glarePosition='all' glareBorderRadius='1rem' className={styles['main-container']}>
                <button className={styles.cancel}>
                    <FontAwesomeIcon icon={faXmark} className={styles['cancel-sign']}/>
                </button>
                <h1 style={{marginBottom: '3rem'}}>
                    Sign Up
                </h1>
                <div className={styles['input-wrapper']} style={{marginBottom: '2rem'}}>
                    <input placeholder='Username' className={styles.input}
                    onChange={(event) => {
                        username.current = event.target.value;
                    }}/>
                    <FontAwesomeIcon icon={faCircleUser}/>
                </div>
                <div className={styles['input-wrapper']} style={{marginBottom: '2rem'}}>
                    <input placeholder='Email' className={styles.input}
                    onChange={(event) => {
                        email.current = event.target.value as Email;
                    }}/>
                    <FontAwesomeIcon icon={faEnvelope}/>
                </div>
                <PasswordInputField callback={(value: string) => {password.current = value;}}/>
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
                    //console.log(username.current, email.current, password.current);
                    if (username.current.length === 0 || username.current.length > 30) {
                        alert('The username should have at least 1 character and no more than 30 characters.');
                        return;
                    }
                    //@.com
                    if (!email.current.includes('@') || !email.current.endsWith('.com') || email.current.length < 'x@x.com'.length || email.current.split('@')[0].length === 0 || email.current.split('@')[1].length < 'x.com'.length) {
                        alert('Please provide a valid email.');
                        return;
                    }
                    if (password.current.length < 5) {
                        alert('The password should have at least 5 characters.');
                        return;
                    }

                    const allUserIds: Email[] = await GetAllUserIds() as Email[];

                    //console.log(allUserIds);
                    if (allUserIds.includes(email.current)) {
                        alert('User email existed. Please consider login.');
                        redirect('/auth/login');
                        return;
                    }

                    const salt: string = await GenerateSalt();
                    const sessionId: string = await GenerateSessionId();

                    AddNewUser(email.current, sessionId, {
                        username: username.current,
                        password: password.current,
                        salt: salt,
                        email: email.current
                    });
                    await SetCookie(sessionId);
                    window.location.href = '/';
                }}
                >
                    Sign Up
                </button>
                <button className={`${styles['login-button']} ${styles['google']}`} style={{marginBottom: '2rem'}}>
                    <FontAwesomeIcon icon={faGoogle} style={{marginRight: '1rem'}}/>
                    Sign up with Google
                </button>
            </Tilt>
        </div>
    );
};