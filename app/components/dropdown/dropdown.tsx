'use client';
import { type JSX, useRef, useState } from 'react';
import styles from './dropdown.module.css';
import { DCSSProperties, MergeDCSS } from './custom-css';

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
    style = MergeDCSS(style);
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
                        ['--offset' as string]: `calc((1.2em + (${style?.padding} * 2)) * -${i + 1})`,
                        ['--background-color' as string]: i === index ? style?.option?.selected?.backgroundColor : style?.backgroundColor,
                        ['--hovered-highlight-color' as string]: style?.option?.hovered?.backgroundColor,
                        padding: style?.padding
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
        <div className={className} style={style?.whole}>
            <div className={styles['dropdown-wrapper']} style={{lineHeight: 1.2}}>
                <div className={styles.select} style={{
                    backgroundColor: style?.backgroundColor,
                    borderRadius: style?.borderRadius,
                    color: style?.whole?.color,
                    padding: style?.padding
                }} onClick={() => {setIsDropdown(!isDropdown);}}>
                    <div style={{flexGrow: 1, width: `${GetLongestName()}ch`}}>
                    {
                        options[index].option
                    }
                    </div>
                    <div className={`${styles.arrow} ${isDropdown ? styles['arrow-up'] : styles['arrow-down']}`} style={{
                        borderBottom: `2px solid ${style?.whole?.color}`,
                        borderRight: `2px solid ${style?.whole?.color}`
                    }}/>
                </div>
                <div className={styles['option-wrapper']} style={{
                    top: `calc(1.2em + (${style?.padding} * 2))`
                }}>
                {
                    RenderOptions()
                }
                </div>
            </div>
        </div>
    );
}