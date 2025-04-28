import type { Metadata } from 'next';
import type { JSX } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Navbar from './components/navbar/navbar';

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

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>): Promise<JSX.Element> {
    return (
    <html>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <Navbar/>
            {children}
        </body>
    </html>
    );
}