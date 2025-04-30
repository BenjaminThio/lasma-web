'use client';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import Image from 'next/image';
import placeholder from './../../../public/images/galaxy.png';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAtom } from '@fortawesome/free-solid-svg-icons';
import styles from './navbar.module.css';
import Profile from './profile';
import { useEffect, useState } from 'react';
import { UserProps } from '@/utils/firestore';
import { GetUser } from '@/app/auth/auth';

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function Navbar() {
    const [userProfileDropdown, setUserProfileDropdown] = useState<boolean>(false);
    const [userProps, setUserProps] = useState<UserProps | null>(null);

    useEffect(() => {
        async function FetchUser() {
            const user = await GetUser();
            
            setUserProps(user);
        }

        FetchUser();
    }, []);

    return (
    <nav className={fusionPixel12px.className} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3}}>
        <Link href='/' style={{fontSize: 'large', textDecoration: 'none', color: 'white', marginLeft: '1.5rem', fontWeight: 'bold'}}>
            <FontAwesomeIcon icon={faAtom} className={styles.logo}/> LASMA STUDIO
        </Link>
        <div style={{marginRight: '1.5rem', display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'center'}}>
            <Link href='/apps' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>Apps</Link>
            <Link href='/console' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>Go to console</Link>
            {
            userProps === null
            ?
            <>
            <Link href='/auth' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>Sign up</Link>
            <Link href='/auth' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>Login</Link>
            </>
            :
            <div style={{position: 'relative', cursor: 'pointer'}}>
                <span onClick={() => {setUserProfileDropdown(!userProfileDropdown);}}>
                    <div style={{width: '2.3rem', aspectRatio: 1, borderRadius: '50%', position: 'absolute', boxShadow: 'inset 0 0 0.4rem 0.2rem rgb(255, 255, 255, 0.6)'}}/>
                    <Image src={placeholder} width={0} height={0} style={{
                        width: '2.3rem',
                        height: 'auto',
                        aspectRatio: 1,
                        borderRadius: '50%'
                    }} alt='pfp'/>
                </span>
                {
                    userProfileDropdown
                    ?
                    <Profile userProps={userProps} callback={() => {setUserProfileDropdown(!userProfileDropdown);}} callbackForLogOut={async () => {
                        const user: UserProps | null = await GetUser();

                        setUserProps(user);
                    }}/>
                    :
                    null
                }
            </div>
            }
        </div>
    </nav>
    );
}