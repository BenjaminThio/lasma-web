import { UserProps } from '@/utils/firestore';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import placeholder from './../../../public/images/galaxy.png';
import Image from 'next/image';
import styles from './navbar.module.css';
import { LogOut } from '@/app/auth/auth';

interface ProfileProps {
    userProps: UserProps;
    callback: () => void;
    callbackForLogOut: () => void;
}

export default function Profile({userProps, callback, callbackForLogOut}: ProfileProps) {
    return (
        <div style={{
            position: 'absolute',
            right: 0,
            top: '4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.7rem',
            backgroundColor: '#1b1b1b',
            padding: '0.7rem',
            borderRadius: '1rem',
            width: '15rem',
            cursor: 'default',
            border: '3px solid #131314'
        }}>
            <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{
                    textAlign: 'center',
                    backgroundColor: '#282a2c',
                    paddingTop: '0.7rem',
                    paddingBottom: '0.7rem',
                    borderTopLeftRadius: '0.7rem',
                    borderTopRightRadius: '0.7rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 'large'
                }}>
                    {userProps.info.email}
                </div>
                <Image src={placeholder} width={0} height={0} style={{width: '100%', height: 'auto', imageRendering: 'pixelated', objectFit: 'cover'}} alt='pfp' draggable={false} unoptimized/>
                <div style={{
                    textAlign: 'center',
                    backgroundColor: '#282a2c',
                    paddingTop: '0.7rem',
                    paddingBottom: '0.7rem',
                    borderBottomLeftRadius: '0.7rem',
                    borderBottomRightRadius: '0.7rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 'large'
                }}>
                    {userProps.info.username}
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%'}}>
                {
                /*<>
                <button className={`${styles['sign-up-button']} ${styles.button}`} style={{
                    border: 'none',
                    fontSize: 'large',
                    fontFamily: 'inherit',
                    color: 'white',
                    padding: '1rem',
                    flexGrow: 1
                }}>
                    Sign Up
                </button>
                <button className={`${styles['login-button']} ${styles.button}`} style={{
                    border: 'none',
                    fontSize: 'large',
                    fontFamily: 'inherit',
                    color: 'white',
                    padding: '1rem',
                    flexGrow: 1
                }}>
                    Log In
                </button>
                </>*/
                }
                <button className={`${styles.edit} ${styles.button2}`} style={{
                    border: 'none',
                    fontSize: 'large',
                    fontFamily: 'inherit',
                    color: 'white',
                    padding: '0.7rem',
                    backgroundColor: '#282a2c',
                    flexGrow: 1
                }} onClick={() => {console.log('Under development.');}}>Edit</button>
                <button className={`${styles['log-out']} ${styles.button2}`} style={{
                    border: 'none',
                    fontSize: 'large',
                    fontFamily: 'inherit',
                    color: 'white',
                    padding: '0.7rem',
                    backgroundColor: '#282a2c',
                    flexGrow: 1
                }} onClick={() => {
                    LogOut();
                    callbackForLogOut();
                }}>Log Out</button>
            </div>
            <div style={{
                position: 'absolute',
                top: '-0.2rem',
                right: '-0.2rem',
                backgroundColor: 'rgb(53, 60, 63)',
                width: '2rem',
                aspectRatio: 1,
                borderRadius: '0 1rem 0 1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }} className={styles.cancel} onClick={callback}>
                <FontAwesomeIcon icon={faXmark} style={{fontSize: 'x-large'}}/>
            </div>
        </div>
    );
}