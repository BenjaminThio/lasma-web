import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import Image from 'next/image';
import placeholder from './../../../public/images/galaxy.png';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAtom } from '@fortawesome/free-solid-svg-icons';
import styles from './navbar.module.css';
import Panel from './panel';

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function Navbar() {
    return (
    <nav className={fusionPixel12px.className} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link href='/' style={{fontSize: 'large', textDecoration: 'none', color: 'white', marginLeft: '1.5rem', fontWeight: 'bold'}}>
            <FontAwesomeIcon icon={faAtom} className={styles.logo}/> LASMA STUDIO
        </Link>
        <div style={{marginRight: '1.5rem', display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'center'}}>
            <Link href='/apps' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>Apps</Link>
            <Link href='/console' style={{textDecoration: 'none', color: 'white', fontSize: 'large'}}>Go to console</Link>
            <div style={{position: 'relative', cursor: 'pointer'}}>
                <div style={{width: '2.3rem', aspectRatio: 1, borderRadius: '50%', position: 'absolute', boxShadow: 'inset 0 0 0.4rem 0.2rem rgb(255, 255, 255, 0.6)'}}/>
                <Image src={placeholder} width={0} height={0} style={{
                    width: '2.3rem',
                    height: 'auto',
                    aspectRatio: 1,
                    borderRadius: '50%'
                }} alt='pfp'/>
                <Panel/>
            </div>
        </div>
    </nav>
    );
}