'use client';
import { type JSX, useState, ChangeEvent } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import { Image2Base64 } from '@/utils/image';

export default function Image2Base64Component(): JSX.Element {
    const [imageBase64, setImageBase64] = useState<string>('');

    return (
        <>
            {imageBase64 !== '' ? <Image src={imageBase64} width={0} height={0} sizes='100svw' alt='image' draggable={false} className={styles.monitor}/> : null} 
            <div style={{display: 'flex', gap: '1rem'}}>
                <label className={styles.button}>
                    CHOOSE FILE
                    <input type='file' accept='image/*' style={{display: 'none'}} onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                        const files: FileList | null = event.target.files;

                        if (files !== null && files.length > 0) {
                            setImageBase64(await Image2Base64(files[0]));
                        }
                        /* const files: FileList | null = event.target.files;

                        if (files !== null && files.length > 0) setImage(URL.createObjectURL(files[0]));
                        else setImage(''); */
                    }}/>
                </label>
                <button className={styles.button} onClick={() => {
                    navigator.clipboard.writeText(imageBase64);
                }}>COPY BASE64</button>
            </div>
        </>
    );
}