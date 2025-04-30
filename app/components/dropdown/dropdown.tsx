'use client';
import { CSSProperties, type JSX, useRef, useState } from 'react';
import styles from './dropdown.module.css';

interface Option {
    option: string;
    value: number | string;
}



interface DropdownProps {
    className?: string;
    style?: CSSProperties;
    defaultIndex?: number;
    backgroundColor?: string;
    textColor?: string;
    hoveredHighlightColor?: string;
    selectedHighlightColor?: string;
    options: Option[];
    onChange?: (value: (number | string)) => void;
}

export default function Dropdown({className, style, options, defaultIndex = 0, onChange = () => {}, backgroundColor = 'white', textColor = 'black', hoveredHighlightColor = 'lightgreen', selectedHighlightColor = 'lightskyblue'}: DropdownProps) {
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
                <div key={i} style={{
                    ['--offset' as string]: `calc((1.2em + 1rem) * -${i + 1})`,
                    ['--background-color' as string]: i === index ? selectedHighlightColor : backgroundColor,
                    ['--hovered-highlight-color' as string]: hoveredHighlightColor,
                    color: textColor
                }}
                    className={`${styles.option} ${isDropdown ? styles.extend : ''}`} 
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
        <div className={className} style={style}>
            <div className={styles['dropdown-wrapper']} style={{lineHeight: 1.2}} onClick={() => {setIsDropdown(!isDropdown);}}>
                <div className={styles.select} style={{backgroundColor: backgroundColor, color: textColor}}>
                    <div style={{flexGrow: 1, width: `${GetLongestName()}ch`}}>
                    {
                        options[index].option
                    }
                    </div>
                    <div style={{borderRight: `2px solid ${textColor}`, borderBottom: `2px solid ${textColor}`}} className={`${styles.arrow} ${isDropdown ? styles['arrow-up'] : styles['arrow-down']}`}/>
                </div>
                <div className={styles['option-wrapper']}>
                {
                    RenderOptions()
                }
                </div>
            </div>
        </div>
    );
}