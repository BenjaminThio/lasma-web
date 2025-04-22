'use client';
import { type JSX,type CSSProperties, type ChangeEvent, useState } from 'react';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import styles from './page.module.css';
import Switch from '../components/switch/switch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faEye, faPencil, faTable, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const determinationFont: NextFont = localFont({
    src: './../../public/fonts/Mars_Needs_Cunnilingus.ttf'
});

interface Cell {
    content: string | JSX.Element;
    className?: string | undefined;
    style?: CSSProperties | undefined;
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
        <th className={cell.className} style={cell.style} key={i} >
            {cell.content}
        </th>
        :
        <td className={cell.className} style={cell.style} key={i}>
            {cell.content}
        </td>
        );
    }

    return (<tr>{rowCells}</tr>);
}

export default function ConsolePage(): JSX.Element {
    const [maxValueTest, setMaxValueTest] = useState<number>(10);

    function RenderRow(gameCount: number, maxValue: number) {
        const cells: JSX.Element[] = [];

        for (let i: number = 1; i <= (gameCount > (maxValue > 100 ? 1000 : maxValue) ? (maxValue > 100 ? 1000 : maxValue) : gameCount); i++) {
            cells.push(<Row key={i} cells={[
                {content: `${i.toString()}.`},
                {content: 'Benjamin Thio Zi Liang'},
                {content: '14348e63-297b-439c-b087-17d951615461'},
                {content: <Switch animated/>, style: {textAlign: 'center'}},
                {content: <FontAwesomeIcon icon={faEye}/>, className: styles.zoom, style: {textAlign: 'center'}},
                {content: <FontAwesomeIcon icon={faPencil}/>, className: styles.zoom, style: {textAlign: 'center'}},
                {content: <FontAwesomeIcon icon={faTrashCan}/>, className: styles.zoom, style: {textAlign: 'center'}}
            ]}/>);
        }

        return cells;
    }

    return (
    <div className={`${styles['main-container']} ${determinationFont.className}`}>
        <div style={{height: '13rem', width: '23rem', position: 'relative', backgroundColor: '#282a2c', borderRadius: '1rem'}}>
            <span style={{position: 'absolute', top: '1rem', left: '1rem'}}>
                My Games
            </span>
            <FontAwesomeIcon icon={faCube} style={{position: 'absolute', bottom: '1rem', left: '1rem'}}/>
            <span style={{position: 'absolute', bottom: '1rem', right: '1rem'}}>
                {maxValueTest}
            </span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                <span><FontAwesomeIcon icon={faTable}/>Game List</span>
                <select defaultValue={10} onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setMaxValueTest(parseInt(event.target.value));
                }}>
                    <option value={101}>Show All</option>
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <table className={styles.table}>
                <tbody>
                    <Row header cells={[
                        {content: 'NO.', style: {textAlign: 'left'}},
                        {content: 'TITLE', style: {textAlign: 'left'}},
                        {content: 'API KEY', style: {textAlign: 'left'}},
                        {content: 'PUBLIC'},
                        {content: 'VIEW'},
                        {content: 'EDIT'},
                        {content: 'DELETE'}
                    ]}/>
                    {
                        RenderRow(49, maxValueTest)
                    }
                </tbody>
            </table>
        </div>
    </div>
    );
};