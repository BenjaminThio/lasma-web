import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faMugHot } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function Footer() {
    return (
        <footer className={fusionPixel12px.className} style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 'x-large',
            padding: '5rem',
            height: 'fit-content',
            width: 'calc(100% - 10rem)',
            gap: '2rem',
            overflow: 'auto'
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
                        <Link href='/pop-yi-fan' style={{fontSize: 'large', textDecoration: 'none', color: 'white'}}>Pop Yi Fan</Link>
                        <Link href='/dafans' style={{fontSize: 'large', textDecoration: 'none', color: 'white'}}>Dafans</Link>
                        <Link href='/stop-syurga' style={{fontSize: 'large', textDecoration: 'none', color: 'white'}}>Stop Syurga</Link>
                        <Link href='/path-of-chemistry' style={{fontSize: 'large', textDecoration: 'none', color: 'white'}}>Path of Chemistry</Link>
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
                        Buy Me a Coffee <FontAwesomeIcon icon={faMugHot}/>
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
    );
}