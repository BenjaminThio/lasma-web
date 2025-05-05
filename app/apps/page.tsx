import type { JSX } from 'react';
import styles from './page.module.css';
import AppCard from '../components/apps/app-card';
import { AppProps, GetAllAppsIDPropsPairs } from '@/utils/firestore';

export default async function AppsPage(): Promise<JSX.Element> {
    async function GenerateAppCards() {
        const apps: Record<string, AppProps> = await GetAllAppsIDPropsPairs();
        const appIds: string[] = Object.keys(apps);
        const appCards: JSX.Element[] = [];

        for (let i = 0; i < appIds.length; i++) {
            const appId: string = appIds[i];

            appCards.push(<AppCard link={`/app/${appId}`} thumnail={apps[appId].info.thumbnail} name={apps[appId].info.name} description={apps[appId].info.description} status={apps[appId].info.status} platforms={apps[appId].info.platforms} tag={apps[appId].info.tag} key={i}/>);
        }

        return appCards;
    }

    return (
        <div className={styles.background}>
            <div className={styles['main-container']}>
                {GenerateAppCards()}
            </div>
        </div>
    );
}