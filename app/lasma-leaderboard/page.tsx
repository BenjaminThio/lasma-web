import type { JSX } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';
import Row from './../components/row';
import Image from 'next/image';
import Test from './../components/test';

const determinationFont: NextFont = localFont({
    src: './../../public/fonts/Mars_Needs_Cunnilingus.ttf'
});

export default function LasmaLeaderboardPage(): JSX.Element {
    function generateNameList(quantity: number): JSX.Element[] {
        const nameList: JSX.Element[] = [
            <div className={styles['item-container']} key={0}>
                <Row field1='No.' field2='Name' field3='ID' field4='Score' field5='Date'/>
            </div>
        ];

        if (quantity === 0) {
            nameList.push(
                <div className={`${styles['item-container']} ${styles['placeholder-container']}`} key={1}>
                    There is nothing here.
                </div>
            );
        }
        else {
            for (let i: number = 1; i <= quantity; i++) {
                nameList.push(
                    <div className={styles['item-container']} key={i}>
                        <Row field1={i.toString() + '.'} field2='Benjamin Thio' field3='#0001' field4='0' field5='4/4/2025'/>
                    </div>
                );
            }
        }
        
        return nameList;
    }

    return (
    <div className={`${styles['main-container']} ${determinationFont.className}`}> 
        <div className={styles['list-container']}>
            <Image src='/images/logo.png' width={0} height={0} sizes='100dvw' draggable={false} className={styles.logo} alt='logo' unoptimized/>
            {generateNameList(50)}
        </div>
        <Test/>
    </div>
    );
};