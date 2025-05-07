'use client';
import { type JSX,type CSSProperties, type ChangeEvent, useState, useEffect } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';
import Switch from '../components/switch/switch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPencil, faTable, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { redirect } from 'next/navigation';
import { GetUser } from '../auth/auth';
import { DeleteApp, GetApp, UpdateApp, UserProps } from '@/utils/firestore';
import { AppProps } from '@/utils/firestore';
import { sleep } from '@/utils/time';
import Dropdown from '../components/dropdown/dropdown';

const determinationFont: NextFont = localFont({
    src: './../../public/fonts/Monospaced_Mars_Needs_Cunnilingus.ttf'
});

interface Cell {
    content: string | JSX.Element;
    className?: string | undefined;
    style?: CSSProperties | undefined;
    callback?: () => void | Promise<void>;
}

interface RowProps {
    header?: boolean;
    cells: Cell[];
}

function Row({header = false, cells}: RowProps): JSX.Element {
    const rowCells: JSX.Element[] = [];
    
    for (let i: number = 0; i < cells.length; i++)
    {
        const cell: Cell = cells[i];

        rowCells.push(
            header
            ?
            <th className={cell.className} style={cell.style} key={i}>
                {cell.content}
            </th>
            :
            (
                cell.callback === undefined
                ?
                <td className={cell.className} style={cell.style} key={i}>
                    {cell.content}
                </td>
                :
                <td className={cell.className} style={cell.style} key={i} onClick={cell.callback}>
                    {cell.content}
                </td>
            )
        );
    }

    return (<tr>{rowCells}</tr>);
}

export default function ConsolePage(): JSX.Element {
    const [maxValueTest, setMaxValueTest] = useState<number>(10);
    const [userProps, setUserProps] = useState<UserProps | null>(null);
    const [rows, setRows] = useState<JSX.Element[]>([]);
    //const [loading, setLoading] = useState<boolean>(false);
    const [dots, setDots] = useState<string>('');

    useEffect(() => {
        async function GenerateLoadingDots() {
            let renderer: string = '';

            for (let i: number = 0; i < 3; i++) {
                renderer += '.';
                setDots(renderer);

                await sleep(500);
            }

            await GenerateLoadingDots();
        }

        async function FetchUser() {
            const user: UserProps | null = await GetUser();
            if (user === null) {
                redirect('/auth/login');
            }
            else {
                setUserProps(user);
                RenderRow(user, maxValueTest);
            }
        }
        
        GenerateLoadingDots();
        FetchUser();
    }, []);

    async function RenderRow(user: UserProps, maxValue: number) {
        const cells: JSX.Element[] = [];

        if (user !== null) {
            const appCount: number = user.apps.length;

            for (let i: number = 1; i <= (appCount > (maxValue > 100 ? 1000 : maxValue) ? (maxValue > 100 ? 1000 : maxValue) : appCount); i++) {
                const appId: string = user.apps[i - 1];
                const app: AppProps | null = await GetApp(appId);

                if (app !== null) {
                    cells.push(<Row key={i} cells={[
                        {content: `${i.toString()}.`},
                        {content: app.info.name},
                        {content: appId},
                        {content: <Switch defaultChecked={app.isGlobal} callback={async (checked) => {
                            await UpdateApp(appId, 'isGlobal', checked);
                        }} animated/>, style: {textAlign: 'center'}},
                        {content: <FontAwesomeIcon icon={faEye}/>, className: styles.zoom, style: {textAlign: 'center'}, callback: () => {
                            redirect(`/app/${appId}`);
                        }},
                        {content: <FontAwesomeIcon icon={faPencil}/>, className: styles.zoom, style: {textAlign: 'center'}, callback: () => {
                            redirect(`/app/${appId}/edit`);
                        }},
                        {content: <FontAwesomeIcon icon={faTrashCan}/>, className: styles.zoom, style: {textAlign: 'center'}, callback: async () => {
                            await DeleteApp(appId);
                            setUserProps(await GetUser());
                            RenderRow(user, maxValue);
                        }}
                    ]}/>);
                }
            }
        }

        setRows(cells);
    }

    if (userProps === null) {
        return (
            <div className={`${determinationFont.className} ${styles.loading}`}style={{
                height: '100svh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 'xx-large',
            }}>
                <div style={{width: '21ch'}}>
                    Fetching user data{dots}
                </div>
            </div>
        );
    }
    
    return (
    <div className={`${styles['main-container']} ${determinationFont.className}`}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, fontSize: 'x-large', marginTop: '5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}} className={styles['default-width']}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'xx-large'}}>
                    <FontAwesomeIcon icon={faTable}/>
                    Game List
                    <div style={{backgroundColor: 'red', width: '3ch', height: '1em', padding: '0.4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '0.5rem', fontSize: 'large'}}>
                        {userProps?.apps.length ?? 0}
                    </div>
                </div>
                
                <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button onClick={() => {
                        redirect('/create-app');
                    }} style={{
                        color: 'white',
                        backgroundColor: '#282a2c',
                        border: 'none',
                        borderRadius: '50%',
                        width: '2.5rem',
                        height: 'fit-content',
                        aspectRatio: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bolder',
                        fontFamily: 'inherit',
                        fontSize: 'x-large',
                        cursor: 'pointer'
                    }}>+</button>
                    <select defaultValue={10} onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        setMaxValueTest(parseInt(event.target.value));
                    }} style={{
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        color: 'white',
                        backgroundColor: '#282a2c',
                        borderRadius: '0.5rem',
                        paddingLeft: '0.5rem',
                        fontSize: 'x-large'
                    }}>
                        <option value={101}>Show All</option>
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <Dropdown defaultIndex={1} options={[
                        {option: 'Show All', value: 101},
                        {option: '10', value: 10},
                        {option: '50', value: 50},
                        {option: '100', value: 100}
                    ]} style={{
                        whole: {
                            color: 'white'
                        },
                        backgroundColor: '#282a2c'
                    }}onChange={(value: number | number[] | string) => {
                        console.log(value);
                        setMaxValueTest(value as number);
                    }}/>
                </div>
            </div>
            <table className={styles.table}>
                <tbody>
                    <Row header cells={[
                        {content: 'NO.', style: {textAlign: 'left', minWidth: '5ch'}},
                        {content: 'TITLE', style: {textAlign: 'left', minWidth: '20ch'}},
                        {content: 'API KEY', style: {textAlign: 'left', minWidth: '36ch'}},
                        {content: 'PUBLIC', style: {minWidth: '6ch'}},
                        {content: 'VIEW', style: {minWidth: '4ch'}},
                        {content: 'EDIT', style: {minWidth: '4ch'}},
                        {content: 'DELETE', style: {minWidth: '6ch'}}
                    ]}/>
                    {rows}
                </tbody>
            </table>
            {/*
                loading
                ? 
                <div style={{
                    backgroundColor: '#282a2c',
                    flexGrow: 1,
                    marginBottom: '1rem',
                    borderBottomLeftRadius: '0.5rem',
                    borderBottomRightRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} className={styles['default-width']}>
                    <div className={styles.loading} style={{width: '21ch'}}>
                        Fetching apps data{dots}
                    </div>
                </div>
                :
            */
                userProps.apps.length > 0
                ? 
                null
                :
                <div style={{
                    backgroundColor: '#282a2c', 
                    flexGrow: 1,
                    marginBottom: '1rem',
                    borderBottomLeftRadius: '0.5rem',
                    borderBottomRightRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} className={styles['default-width']}>
                    There is nothing here.
                </div>
            }
        </div>
    </div>
    );
};