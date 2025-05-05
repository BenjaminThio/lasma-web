import { type JSX } from 'react';
import Link from 'next/link';

interface TabProps {
    className?: string;
    left: string;
    isDropdown: boolean
}

export default function Tab({className, left, isDropdown}: TabProps): JSX.Element {
    return (
    <div className={className} style={{
        position: 'fixed',
        height: '15rem',
        width: '40rem',
        top: isDropdown ? '3.5rem' : 'calc(-15rem + 3.5rem)',
        display: 'flex',
        borderRadius: '0 0 0.5rem 0.5rem',
        overflow: 'clip',
        transition: '0.3s',
        zIndex: 1,
        left: left,
        opacity: isDropdown ? 1 : 0
    }}>
        <div style={{
            backgroundColor: 'black',
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.5rem'
        }}>
            <div style={{width: '80%', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{fontSize: 'xx-large', fontWeight: 'bold', color: 'rgb(255, 210, 0)'}}>
                    Components
                </div>
                <div style={{fontSize: 'medium'}}>
                    Look how we created our own custom components, while testing them in each separated page.
                </div>
            </div>
            <button style={{
                backgroundColor: 'transparent',
                border: '0.15rem solid rgb(255, 200, 0)',
                color: 'white',
                fontFamily: 'inherit',
                padding: '0.5rem',
                borderRadius: '1rem',
                fontSize: 'medium'
            }}>
                Testing123
            </button>
        </div>
        <div style={{
            backgroundColor: 'rgb(37, 40, 48)',
            flexGrow: 1,
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div style={{
                fontSize: 'large',
                fontWeight: 'bold'
            }}>
                Pages
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexGrow: 1
            }}>
                <Link href='/components/apps' style={{
                    width: 'fit-content',
                    color: 'white',
                    textDecoration: 'none',
                    cursor: 'pointer'
                }}>
                    {'<Lightbulb/>'}
                </Link>
                <Link href='/components/image' style={{
                    width: 'fit-content',
                    color: 'white',
                    textDecoration: 'none',
                    cursor: 'pointer'
                }}>
                    {'<Image2Base64/>'}
                </Link>
                <Link href='/components/switch' style={{
                    width: 'fit-content',
                    color: 'white',
                    textDecoration: 'none',
                    cursor: 'pointer'
                }}>
                    {'<Switch/>'}
                </Link>
                <Link href='/components/dropdown' style={{
                    width: 'fit-content',
                    color: 'white',
                    textDecoration: 'none',
                    cursor: 'pointer'
                }}>
                    {'<Dropdown/>'}
                </Link>
            </div>
        </div>
    </div>
    );
}