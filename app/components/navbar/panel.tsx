'use client';
import { GetUser } from '@/app/auth/auth';
import { UserProps } from '@/utils/firestore';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import placeholder from './../../../public/images/galaxy.png';
import Image from 'next/image';

export default function Panel() {
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        async function FetachUser() {
            const user: UserProps | null = await GetUser();

            if (user !== null) {
                setEmail(user.info.email);
            }
        }

        FetachUser();
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: '4.0rem',
            right: 0,
            backgroundColor: '#282a2c',
            borderRadius: '1rem',
            minWidth: '20rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'default',
            gap: '2rem'
        }}>
            <div style={{width: '100%', display: 'flex'}}>
                <div style={{display: 'flex', justifyContent: 'center', flexGrow: 1, height: 'min-content'}}>
                    {email}
                </div>
                <button style={{height: 'min-content'}}>
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div>
            <Image src={placeholder} width={0} height={0} style={{width: '6rem', height: 'auto', aspectRatio: 1, borderRadius: '50%'}} alt='pfp'/>
            <div style={{display: 'flex', gap: '0.2rem'}}>
                <button style={{
                    padding: '1rem',
                    fontFamily: 'inherit',
                    fontSize: 'large',
                    border: 'none',
                    backgroundColor: 'rgb(59, 61, 64)',
                    color: 'white',
                    borderRadius: '1rem 0 0 1rem',
                }}>
                    Sign In
                </button>
                <button style={{
                    padding: '1rem',
                    fontFamily: 'inherit',
                    fontSize: 'large',
                    border: 'none',
                    backgroundColor: 'rgb(59, 61, 64)',
                    borderRadius: '0 1rem 1rem  0',
                    color: 'white'
                }}>
                    Log In
                </button>
            </div>
        </div>
    );
}