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
import Tab from './tab';
//import Dropdown from './dropdown';

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function Navbar() {
    const [userProfileDropdown, setUserProfileDropdown] = useState<boolean>(false);
    const [userProps, setUserProps] = useState<UserProps | null>(null);
    const [isDropdown, setIsDropdown] = useState<boolean>(false);
    const TITLE: string = ' LASMA STUDIO';
    const GAP: string = '1.5rem';
    const FONTAWESOME_FIXED_WIDTH: string = '1.25em';
    const PROFILE_PICTURE_WIDTH: string = '2.3rem';
    const NAV_ITEMS: Record<string, string[]> = {
        SIGNED_IN: ['Apps', 'Go to console'],
        LOGGED_OUT: ['Sign up', 'Login']
    };

    function GetTabPosition(): string {
        const userState: string = userProps === null ? 'LOGGED_OUT' : 'SIGNED_IN';

        //Margin Left + Atom Font Awesome + Title Width(LASMA STUDIO) + ((100% of Wcreen Width - (Margin Left + Atom Font Awesome + Title Width(LASMA STUDIO) + Flex Gap + Nav Item(Apps Width) + Flex Gap + Nav Item(Go Console Width) + Profile Picture + Margin Right) / 2) - Half Tab Card Width)
        return `calc(${GAP} + ${FONTAWESOME_FIXED_WIDTH} + ${TITLE.length}ch + ((100% - ((${GAP} * 4) + ${FONTAWESOME_FIXED_WIDTH} + ${TITLE.length + NAV_ITEMS[userState][0].length + NAV_ITEMS[userState][1].length}ch + ${userState === null ? '' : PROFILE_PICTURE_WIDTH})) / 2) - 20rem)`;
    }

    useEffect(() => {
        async function FetchUser() {
            const user = await GetUser();
            
            setUserProps(user);
        }

        FetchUser();
    }, []);

    return (
    <>
    <Tab className={fusionPixel12px.className} left={GetTabPosition()} isDropdown={isDropdown}/>
    <nav className={fusionPixel12px.className} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        backgroundColor: '#282a2c',
        width: '100%',
        height: '3.5rem',
        boxShadow: '0 0.8rem 0.7rem -0.5rem rgb(0, 0, 0, 0.5)',
        zIndex: 1
    }}>
        <Link href='/' style={{fontSize: 'large', textDecoration: 'none', color: 'white', marginLeft: '1.5rem', fontWeight: 'bold'}}>
            <FontAwesomeIcon icon={faAtom} className={styles.logo} fixedWidth/>{TITLE}
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => {setIsDropdown(!isDropdown);}}>
            Components<span style={{
            width: 0,
            height: 0,
            borderTop: '0.7ch solid white',
            borderRight: '0.7ch solid transparent',
            borderBottom: 'none',
            borderLeft: '0.7ch solid transparent',
            rotate: isDropdown ? '-180deg' : '0deg',
            transition: '0.2s'
        }}/>
        </div>
        <div style={{marginRight: '1.5rem', display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'center'}}>
            <Link href='/apps' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>{NAV_ITEMS.SIGNED_IN[0]}</Link>
            {
            userProps === null
            ?
            <>
            <Link href='/auth/sign-up' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>{NAV_ITEMS.LOGGED_OUT[0]}</Link>
            <Link href='/auth/login' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>{NAV_ITEMS.LOGGED_OUT[1]}</Link>
            </>
            :
            <>
            <Link href='/console' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>{NAV_ITEMS.SIGNED_IN[1]}</Link>
            <div style={{position: 'relative', cursor: 'pointer'}}>
                <span onClick={() => {setUserProfileDropdown(!userProfileDropdown);}}>
                    <div style={{width: PROFILE_PICTURE_WIDTH, aspectRatio: 1, borderRadius: '50%', position: 'absolute', boxShadow: 'inset 0 0 0.4rem 0.2rem rgb(255, 255, 255, 0.6)'}}/>
                    <Image src={placeholder} width={0} height={0} style={{
                        width: PROFILE_PICTURE_WIDTH,
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
            </>
            }
        </div>
    </nav>
    </>
    );
}