import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './apps.module.css';
import { faWindows, faLinux, faApple, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { PlatformsProps } from '@/utils/firestore';

export default function Platform({windows, linux, macOs, android}: PlatformsProps) {
    return (
        <>
        {   
            windows || linux || macOs || android
            ?
            <div className={styles['platform-container']}>
                {
                    windows ? <FontAwesomeIcon icon={faWindows}/> : null
                }
                {
                    linux ? <FontAwesomeIcon icon={faLinux}/> : null
                }
                {
                    macOs ? <FontAwesomeIcon icon={faApple}/> : null
                }
                {
                    android ? <FontAwesomeIcon icon={faAndroid}/> : null
                }
            </div>
            :
            null
        }
        </>
    );
}