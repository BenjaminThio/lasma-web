'use client';
import { type JSX, useRef, useState } from 'react';
import styles from './dropdown.module.css';
import { DCSS, DCSSProperties, MergeDCSS } from './custom-css';

interface Option {
    option: string;
    value: number | string;
}

interface DropdownProps {
    className?: string;
    style?: DCSSProperties
    defaultIndex?: number;
    options: Option[];
    onChange?: (value: number | string) => void;
}

export default function Dropdown({options, className, style, defaultIndex = 0, onChange = () => {}}: DropdownProps) {
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
                        ['--offset' as string]: `calc((1.2em + (${dcss.padding} * 2)) * -${i + 1})`,
                        ['--background-color' as string]: i === index ? dcss.option.selected.backgroundColor : dcss.backgroundColor,
                        ['--hovered-highlight-color' as string]: dcss.option.hovered.backgroundColor,
                        padding: dcss.padding
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
            <div className={styles['dropdown-wrapper']} style={{lineHeight: 1.2}}>
                <div className={styles.select} style={{
                    backgroundColor: dcss.backgroundColor,
                    borderRadius: dcss.borderRadius,
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
                    top: `calc(1.2em + (${dcss.padding} * 2))`
                }}>
                {
                    RenderOptions()
                }
                </div>
            </div>
        </div>
    );
}