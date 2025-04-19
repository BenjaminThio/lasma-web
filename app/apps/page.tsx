import type { JSX } from 'react';
import styles from './page.module.css';
import AppCard from '../components/apps/app-card';
import { AppProps, GetAllApps } from '@/utils/firestore';

export default async function AppsPage(): Promise<JSX.Element> {
    async function GenerateAppCards() {
        const apps: AppProps[] = await GetAllApps();
        const appCards: JSX.Element[] = [];

        for (let i = 0; i < apps.length; i++) {
            appCards.push(<AppCard name={apps[i].info.name} description={apps[i].info.description} status={apps[i].info.status} key={i}/>);
        }

        return appCards;
    }

    return (
        <div className={styles.background}>
            {GenerateAppCards()}
        </div>
    );
}