//'use client;'
//import { use } from 'react';

import { AppProps, GetApp, LeaderboardProps } from "@/utils/firestore";
import type { NextFont } from "next/dist/compiled/@next/font";
import localFont from "next/font/local";
import styles from './page.module.css';
import Test from "./test";

interface ParamsProps {
    params: Promise<{app_id: string}>;
}

/*
export default function AppPage({params}: ParamsProps) {
    const {app_id} = use(params);

    return (
        <div>
            App ID: {app_id}
        </div>
    );
}
*/

const determinationFont: NextFont = localFont({
    src: './../../../public/fonts/Mars_Needs_Cunnilingus.ttf'
});

interface RowProps {
    no: number;
    name: string;
    id: string;
    score: number;
    datetime: string;
}

function Row({no, name, id, score, datetime}: RowProps) {
    return (
    <tr>
        <td>
            {no}.
        </td>
        <td>
            {name}
        </td>
        <td>
            #{id}
        </td>
        <td>
            {score}
        </td>
        <td>
            {datetime}
        </td>
    </tr>
    );
}

export default async function AppPage({params}: ParamsProps) {
    function GenerateRows(leaderboard: LeaderboardProps) {
        const leaderboardEntries = Object.entries(leaderboard);
        const rows = [];

        for (let i: number = 0; i < leaderboardEntries.length; i++) {
            const [id, {name, score, datetime}] = leaderboardEntries[i];
            rows.push(<Row no={i + 1} name={name} id={id} score={score} datetime={datetime} key={i}/>);
        }
        return rows;
    }
    
    const {app_id}: Record<string, string> = await params;
    const app: AppProps | null = await GetApp(app_id);

    if (app !== null) {
        const leaderboard: LeaderboardProps = app.leaderboard;

        return (
            <div className={`${determinationFont.className} ${styles['main-container']}`}>
                <div className={styles['table-wrapper']}>
                    <table className={styles['table-container']}>
                        <tbody>
                            <tr>
                                <th>
                                    NO.
                                </th>
                                <th>
                                    NAME
                                </th>
                                <th>
                                    ID
                                </th>
                                <th>
                                    SCORE
                                </th>
                                <th>
                                    DATE
                                </th>
                            </tr>
                            {
                                GenerateRows(leaderboard)
                            }
                        </tbody>
                    </table>
                    {
                        Object.keys(leaderboard).length === 0
                        ?
                        <div className={styles['alert-container']}>
                            There is nothing here.
                        </div>
                        :
                        null
                    }
                </div>
                <Test uuid={app_id}/>
            </div>
        );
    }
    else {
        return (
            <div style={{height: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                App Not Found
            </div>
        );
    }
}
