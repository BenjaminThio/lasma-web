import type { Metadata } from 'next';
import type { JSX } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import Image from 'next/image';
import placeholder from './../public/images/galaxy.png';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlushed } from '@fortawesome/free-solid-svg-icons';
import { GetUser } from './auth/auth';
import { UserProps } from '@/utils/firestore';
import LogOut from './components/log-out';
config.autoAddCss = false;

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});
  
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});
  
export const metadata: Metadata = {
    title: 'POP YI FAN',
    description: '',
};

const fusionPixel12px: NextFont = localFont({
    src: './../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>): Promise<JSX.Element> {
    const user: UserProps | null = await GetUser();

    return (
    <html>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <nav className={fusionPixel12px.className} style={{overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{padding: '1rem', }}>
                <FontAwesomeIcon icon={faFlushed}/>
                <Link href='/' style={{textDecoration: 'none', color: 'white'}}>
                    LASMA
                </Link>
                </div>
                <div style={{display: 'flex'}}>
                    <Link href='/apps' style={{padding: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white'}}>
                        Apps
                    </Link>
                    <Link href='/console' style={{padding: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white'}}>
                        Go to console
                    </Link>
                    {
                        user === null
                        ?
                        <>
                            <Link href='/auth' style={{padding: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white'}}>
                                Sign Up
                            </Link>
                            <Link href='/auth' style={{padding: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white'}}>
                                Login
                            </Link>
                        </>
                        :
                        <>
                            <div style={{padding: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white'}}>
                                {user.info.username}
                            </div>
                            <LogOut/>
                        </>
                    }
                    <span style={{padding: '1rem', display: 'flex', alignItems: 'center'}}>
                        <Image src={placeholder} width={0} height={0} alt='placeholder' style={{width: '2.5rem', height: '2.5rem', objectFit: 'cover', borderRadius: '50%'}}/>
                    </span>
                </div>
            </nav>
            {children}
            <footer/>
        </body>
    </html>
    );
}