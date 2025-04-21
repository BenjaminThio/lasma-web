import type { Metadata } from 'next';
import type { JSX } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
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

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>): JSX.Element {
    return (
    <html>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <nav/>
            {children}
            <footer/>
        </body>
    </html>
    );
}