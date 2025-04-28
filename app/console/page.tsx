'use client';
import { type JSX,type CSSProperties, type ChangeEvent, useState, useEffect, useRef } from 'react';
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
    const userRef = useRef<UserProps | null>(null);
    const [rows, setRows] = useState<JSX.Element[]>([]);

    useEffect(() => {
        async function FetchUser() {
            const user: UserProps | null = await GetUser();
            if (user === null) {
                redirect('/auth');
            }
            else {
                userRef.current = user;
                RenderRow(maxValueTest);
            }
        }
        
        FetchUser();
    }, [maxValueTest]);

    async function RenderRow(maxValue: number) {
        const cells: JSX.Element[] = [];

        if (userRef.current !== null) {
            const appCount: number = userRef.current.apps.length;

            for (let i: number = 1; i <= (appCount > (maxValue > 100 ? 1000 : maxValue) ? (maxValue > 100 ? 1000 : maxValue) : appCount); i++) {
                const appId: string = userRef.current.apps[i - 1];
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
                            console.log('IN');
                            redirect(`/app/${appId}`);
                        }},
                        {content: <FontAwesomeIcon icon={faPencil}/>, className: styles.zoom, style: {textAlign: 'center'}, callback: () => {
                            redirect(`/app/${appId}/edit`);
                        }},
                        {content: <FontAwesomeIcon icon={faTrashCan}/>, className: styles.zoom, style: {textAlign: 'center'}, callback: async () => {
                            await DeleteApp(appId);
                            userRef.current = await GetUser();
                            RenderRow(maxValue);
                        }}
                    ]}/>);
                }
            }
        }

        setRows(cells);
    }

    return (
    <div className={`${styles['main-container']} ${determinationFont.className}`}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, fontSize: 'x-large', marginTop: '5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}} className={styles['default-width']}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'xx-large'}}>
                    <FontAwesomeIcon icon={faTable}/>
                    Game List
                    <div style={{backgroundColor: 'red', width: '3ch', height: '1em', padding: '0.4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '0.5rem', fontSize: 'large'}}>
                        {userRef.current?.apps.length ?? 0}
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
            {
                userRef.current !== null && userRef.current.apps.length > 0
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