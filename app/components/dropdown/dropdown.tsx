'use client';
import { type JSX, useRef, useState } from 'react';
import styles from './dropdown.module.css';
import { DCSS, DCSSProperties, MergeDCSS } from './custom-css';

interface Option {
    option: string;
    value: number | string;
}

export enum Direction {
    VERTICAL,
    HORIZONTAL
}

interface DropdownProps {
    direction?: Direction;
    className?: string;
    style?: DCSSProperties
    defaultIndex?: number;
    options: Option[];
    onChange?: (value: number | string) => void;
}

export default function Dropdown({options, className, style, defaultIndex = 0, direction = Direction.VERTICAL, onChange = () => {}}: DropdownProps) {
    const dcss: DCSS = MergeDCSS(style);
    const [isDropdown, setIsDropdown] = useState<boolean>(false);
    const [index, setIndex] = useState<number>(defaultIndex);
    const values = useRef<(string | number)[]>([]);

    function GetLongestName(): number {
        let longestName: number = 0;

        for (let i: number = 0; i < options.length; i++) {
            longestName = options[i].option.length > longestName ? options[i].option.length : longestName;
        }

        return longestName;
    }

    function RenderOptions() {
        const optionCells: JSX.Element[] = [];

        for (let i: number = 0; i < options.length; i++) {
            const option: Option = options[i];
            const optionValues: (number | string)[] = values.current;

            values.current = [...optionValues, option.value];
            optionCells.push(
                <div key={i} className={`${styles.option} ${isDropdown ? styles.extend : ''}`}  style={{
                        ['--offset-y' as string]: direction === Direction.VERTICAL ? `calc((1.2em + (${dcss.padding} * 2)) * -${i + 1})` : 0,
                        ['--offset-x' as string]: direction === Direction.HORIZONTAL ? `calc((${GetLongestName()}ch + (${dcss.padding} * 2)) * -${i + 1})` : 0,
                        ['--background-color' as string]: i === index ? dcss.option.selected.backgroundColor : dcss.backgroundColor,
                        ['--hovered-highlight-color' as string]: dcss.option.hovered.backgroundColor,
                        padding: dcss.padding,
                        width: direction === Direction.HORIZONTAL ? `${GetLongestName()}ch` : 'auto',
                        borderRadius: i + 1 === options.length ? direction === Direction.VERTICAL ? '0 0 0.3rem 0.3rem' : '0 0.3rem 0.3rem 0' : 0
                    }}
                    onClick={() => {
                        setIndex(i);
                        onChange(option.value);
                }}>
                    {option.option}
                </div>
            );
        }
        return optionCells;
    }

    return (
        <div className={className} style={dcss.whole}>
            <div className={styles['dropdown-wrapper']} style={{
                lineHeight: 1.2,
                flexDirection: direction === Direction.VERTICAL ? 'column' : 'row'
            }}>
                <div className={styles.select} style={{
                    backgroundColor: dcss.backgroundColor,
                    borderTopLeftRadius: dcss.borderRadius,
                    borderTopRightRadius: direction === Direction.VERTICAL || !isDropdown ? dcss.borderRadius : 0, 
                    borderBottomLeftRadius: dcss.borderRadius,
                    borderBottomRightRadius: direction === Direction.VERTICAL || !isDropdown ? dcss.borderRadius : 0,
                    color: dcss.whole.color,
                    padding: dcss.padding
                }} onClick={() => {setIsDropdown(!isDropdown);}}>
                    <div style={{flexGrow: 1, width: `${GetLongestName()}ch`}}>
                    {
                        options[index].option
                    }
                    </div>
                    <div className={`${styles.arrow} ${isDropdown ? styles['arrow-up'] : styles['arrow-down']}`} style={{
                        borderBottom: `2px solid ${dcss.whole.color}`,
                        borderRight: `2px solid ${dcss.whole.color}`
                    }}/>
                </div>
                <div className={styles['option-wrapper']} style={{
                    top: direction === Direction.VERTICAL ? `calc(1.2em + (${dcss.padding} * 2))` : 'auto',
                    left: direction === Direction.HORIZONTAL ? `calc(${GetLongestName()}ch + (${dcss.padding} * 2) + (0.2rem * 2) + 2px + 0.5rem)` : 'auto',
                    flexDirection: direction === Direction.VERTICAL ? 'column' : 'row',
                    width: direction === Direction.VERTICAL ? '92%' : 'auto'
                }}>
                {
                    RenderOptions()
                }
                </div>
            </div>
        </div>
    );
}