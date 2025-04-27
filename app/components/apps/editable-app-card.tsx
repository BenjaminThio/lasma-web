'use client';
import  { type JSX, type ChangeEvent, useState, useEffect, useRef } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './apps.module.css';
import Image from "next/image";
import placeholder from './../../../public/images/galaxy.png';
import { Image2Base64, ImagePath2Base64 } from '@/utils/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows, faLinux, faApple, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { CreateNewApp, MergeUpdateApp, Status, Tag, UpdateUser } from '@/utils/firestore';
import LightBulb from './light-bulb';
import { GetUser } from '@/app/auth/auth';
import { UserProps } from '@/utils/firestore';
import { redirect } from 'next/navigation';

const fusionPixel12px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

const fusionPixel10px: NextFont = localFont({
    src: './../../../public/fonts/fusion-pixel-10px-monospaced-zh_hans.otf'
});

export interface LocalPlatformsProps {
    windows: boolean;
    linux: boolean;
    macOs: boolean;
    android: boolean;
}

export interface LocalInfoProps {
    updateOnlyAppId?: string | null;
    defaultName?: string;
    defaultDescription?: string;
    defaultStatus?: Status;
    defaultThumbnail?: string;
    defaultPlatforms?: LocalPlatformsProps;
    defaultTag?: Tag;
}

export default function EditableAppCard({updateOnlyAppId=null, defaultName='', defaultDescription='', defaultStatus=Status.Ready, defaultThumbnail='', defaultPlatforms={windows: false, linux: false, macOs: false, android: false}, defaultTag=Tag.Free}: LocalInfoProps): JSX.Element {
    const [dropdown, setDropdown] = useState<boolean>(false);
    
    const [isWindows, setIsWindows] = useState<boolean>(defaultPlatforms.windows);
    const [isLinux, setIsLinux] = useState<boolean>(defaultPlatforms.linux);
    const [isMacOs, setIsMacOs] = useState<boolean>(defaultPlatforms.macOs);
    const [isAndroid, setIsAndroid] = useState<boolean>(defaultPlatforms.android);
    
    const [name, setName] = useState<string>(defaultName);
    const [description, setDescription] = useState<string>(defaultDescription);
    const [status, setStatus] = useState<Status>(defaultStatus);
    const [thumbnail, setThumbnail] = useState<string>(defaultThumbnail);
    const [tag, setTag] = useState<Tag>(defaultTag);

    const userRef = useRef<UserProps | null>(null);

    useEffect(() => {
        async function test() {
            if (defaultThumbnail === '') {
                setThumbnail(await ImagePath2Base64(placeholder.src));
            }
        };
        async function FetachPage() {
            const user: UserProps | null = await GetUser();
            userRef.current = user;

            if (user === null) {
                redirect('/auth');
            }
        }
        
        FetachPage();
        test();
    }, []);

    return (
    <div className={styles['app-card']} style={{scale: 2}}>
        <div className={styles['app-container-upper-component']}>
            <div className={styles['app-image-container']}>
            <label style={{width: '100%', display: 'flex'}}>
                <input type='file' multiple={false} accept='image/*' style={{display: 'none'}} onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                    const files: FileList | null = event.target.files;

                    if (files !== null && files.length > 0) {
                        setThumbnail(await Image2Base64(files[0]));
                    }
                }}/>
                {
                    thumbnail === ''
                    ?
                    null
                    : 
                    <Image
                    src={thumbnail}
                    width={0}
                    height={0}
                    sizes='100dvw'
                    draggable={false}
                    className={styles['app-image']}
                    alt='placeholder'
                    unoptimized/>
                } 
            </label>
            <div className={styles['traffic-light-container']}>
                <LightBulb color={status == Status.Ready ? 'springgreen' : ''} callback={() => setStatus(Status.Ready)} animated/>
                <LightBulb color={status == Status.UnderConstruction ? 'orange' : ''} callback={() => setStatus(Status.UnderConstruction)} animated/>
                <LightBulb color={status == Status.Disabled ? 'red' : ''} callback={() => setStatus(Status.Disabled)} animated/>
            </div>
            <div className={`${fusionPixel10px.className} ${styles['platform-container']}`}>
                <FontAwesomeIcon icon={faPencil} onClick={() => {setDropdown(!dropdown);}}/>
                {
                    dropdown
                    ?
                    <>
                        <FontAwesomeIcon icon={faWindows} className='fa-fw' onClick={() => {setIsWindows(!isWindows);}} style={{backgroundColor: isWindows ? 'rgba(255, 255, 0, 0.3)' : 'transparent'}}/>
                        <FontAwesomeIcon icon={faLinux} className='fa-fw' onClick={() => {setIsLinux(!isLinux);}} style={{backgroundColor: isLinux ? 'rgba(255, 255, 0, 0.3)' : 'transparent'}}/>
                        <FontAwesomeIcon icon={faApple} className='fa-fw' onClick={() => {setIsMacOs(!isMacOs);}} style={{backgroundColor: isMacOs ? 'rgba(255, 255, 0, 0.3)' : 'transparent'}}/>
                        <FontAwesomeIcon icon={faAndroid} className='fa-fw' onClick={() => {setIsAndroid(!isAndroid);}} style={{backgroundColor: isAndroid ? 'rgba(255, 255, 0, 0.3)' : 'transparent'}}/>
                    </>
                    :
                    null
                }
            </div>
            </div>
            <input maxLength={20} value={name} onChange={(event) => {
                setName(event.target.value);
            }} placeholder='Name' className={`${fusionPixel12px.className} ${styles['app-title-container']} ${styles['title-input']}`}/>
        </div>
        <select value={tag} onChange={(event) => {setTag(parseInt(event.target.value));}} className={`${fusionPixel12px.className} ${styles['tag-container']}`} style={{textAlign: 'center', border: 'none', outline: 'none', fontSize: 'medium', color: 'white'}}>
            <option value={0}>FREE</option>
            <option value={1}>PAID</option>
            <option value={2}>WEB</option>
        </select>
        <div className={`${fusionPixel10px.className} ${styles['description-container']}`}>
            <span>
                *
            </span>
            <textarea value={description} maxLength={60} placeholder='Description' className={`${fusionPixel10px.className} ${styles['description-input']}`}
            onChange={(event) => {
                setDescription(event.target.value);
            }}/>
        </div>
        <button onClick={async () => {
            let user: UserProps;

            if (description.length > 60 || description.length === 0) {
                return;
            }
            if (name.length > 20 || name.length === 0) {
                return;
            }
            if (userRef.current !== null) {
                if (updateOnlyAppId !== null) {
                    await MergeUpdateApp(updateOnlyAppId, name, description, status, thumbnail, tag, {windows: isWindows, linux: isLinux, macOs:isMacOs, android: isAndroid});
                } else {
                    user = userRef.current;
                    const uuid = crypto.randomUUID();
                    
                    UpdateUser(user.info.email, 'apps', [...user.apps, uuid]);
                    await CreateNewApp(uuid, {
                        info: {
                            name: name,
                            description: description,
                            thumbnail: thumbnail,
                            category: 'idk',
                            status: status,
                            platforms: {
                                windows: isWindows,
                                linux: isLinux,
                                macOs: isMacOs,
                                android: isAndroid
                            },
                            tag: tag
                        },
                        ownerUUID: user.info.email,
                        isGlobal: true,
                        leaderboard: {}
                    });
                }
            }
            redirect('/console');
        }} className={`${fusionPixel10px.className}`} style={{backgroundColor: '#282a2c', color: 'white', bottom: 0, border: 'none', borderRadius: '0.2rem'}}>
            SAVE
        </button>
    </div>
    );
}