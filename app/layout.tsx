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
import { faAtom } from '@fortawesome/free-solid-svg-icons';
import { GetUser } from './auth/auth';
import { UserProps } from '@/utils/firestore';
import LogOut from './components/log-out';
import { faFacebook, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
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
                <label style={{padding: '1rem', display: 'flex', gap: '0.5rem'}}>
                    <FontAwesomeIcon icon={faAtom}/>
                    <Link href='/' style={{textDecoration: 'none', color: 'white'}}>
                        LASMA STUDIO
                    </Link>
                </label>
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
            <footer className={fusionPixel12px.className} style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 'x-large',
                padding: '5rem'
            }}>
                <div style={{width: '100%', display: 'flex', justifyContent: 'space-around'}}>
                <span style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <div style={{fontWeight: 'bold'}}>Brand</div>
                        <div style={{fontSize: 'large'}}>Lasma 2025 - 2025 © All rights reserved</div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <div style={{fontWeight: 'bold'}}>
                            Other Projects
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <div style={{fontSize: 'large'}}>Pop Yi Fan</div>
                            <div style={{fontSize: 'large'}}>Dafans</div>
                            <div style={{fontSize: 'large'}}>Stop Syurga</div>
                            <div style={{fontSize: 'large'}}>SPath of Chemistry</div>
                        </div>
                    </div>
                </span>
                <span style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{fontWeight: 'bold'}}>
                        The Only Developer
                    </div>
                    <div style={{fontSize: 'large'}}>
                        Benjamin Thio
                    </div>
                </span>
                <span style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{fontWeight: 'bold'}}>
                        Copyrights
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        <div style={{fontSize: 'large'}}>
                            Fonts
                        </div>
                        <div style={{fontSize: 'large'}}>
                            Images
                        </div>
                        <div style={{fontSize: 'large'}}>
                            Idk what to put
                        </div>
                    </div>
                </span>
                <span style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <div style={{fontWeight: 'bold'}}>
                            About Me
                        </div>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <div style={{backgroundColor: 'rgb(56, 59, 62)', fontSize: 'large', height: '2rem', aspectRatio: 1, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <FontAwesomeIcon icon={faInstagram}/>
                            </div>
                            <div style={{backgroundColor: 'rgb(56, 59, 62)', fontSize: 'large', height: '2rem', aspectRatio: 1, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <FontAwesomeIcon icon={faFacebook}/>
                            </div>
                            <div style={{backgroundColor: 'rgb(56, 59, 62)', fontSize: 'large', height: '2rem', aspectRatio: 1, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <FontAwesomeIcon icon={faGithub}/>
                            </div>
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <div style={{fontWeight: 'bold'}}>
                            Buy Me a Coffee
                        </div>
                        <div style={{fontSize: 'large', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <div>
                                No Link Provided
                            </div>
                        </div>
                    </div>
                </span>
                </div>
                <div style={{width: '100%', textAlign: 'center', fontSize: 'large'}}>
                    Built with love by Benjamin Thio © 2025 - 2025
                </div>
            </footer>
        </body>
    </html>
    );
}