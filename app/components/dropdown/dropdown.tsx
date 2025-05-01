'use client';
import { type JSX, useRef, useState, isValidElement } from 'react';
import styles from './dropdown.module.css';
import { DCSS, DCSSProperties, MergeDCSS } from './custom-css';

interface Option {
    option: string | JSX.Element;
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

export default function Dropdown({options, className, style, defaultIndex = 0, direction = Direction.VERTICAL, onChange = () => {}}: DropdownProps): JSX.Element {
    const dcss: DCSS = MergeDCSS(style);
    console.log(dcss);
    const [isDropdown, setIsDropdown] = useState<boolean>(false);
    const [index, setIndex] = useState<number>(defaultIndex);
    const values = useRef<(string | number)[]>([]);

    function GetLongestOption(): string {
        let longestOption: number = 0;

        if (typeof options)
        for (let i: number = 0; i < options.length; i++)
        {
            const option: string | JSX.Element = options[i].option;

            if (isValidElement(option)) {
                return '1.25em';
            }
            else if (typeof option === 'string') {
                longestOption = option.length > longestOption ? option.length : longestOption;
            }
        }
        
        return `${longestOption}ch`;
    }

    function RenderOptions(): JSX.Element[] {
        const optionCells: JSX.Element[] = [];

        for (let i: number = 0; i < options.length; i++) {
            const option: Option = options[i];
            const optionStyles: Record<string, string | number> = {
                '--background-color': i === index ? dcss.option.selected.backgroundColor : dcss.backgroundColor,
                '--hovered-option-highlight-color': dcss.option.hovered.backgroundColor,
                padding: dcss.padding,
                border: dcss.border
            };

            switch (direction) {
                case Direction.VERTICAL:
                    optionStyles['--option-offset'] = `translateY(calc((1.2em + (${dcss.padding} * 2)) * -${i + 1}))`;
                    if (i + 1 === options.length) optionStyles.borderRadius = `0 0 ${dcss.borderRadius} ${dcss.borderRadius}`;
                    break;
                case Direction.HORIZONTAL:
                    optionStyles['--option-offset'] = `translateX(calc((${GetLongestOption()} + (${dcss.padding} * 2)) * -${i + 1}))`;
                    optionStyles.width = GetLongestOption();
                    if (i + 1 === options.length) optionStyles.borderRadius = `0 ${dcss.borderRadius} ${dcss.borderRadius} 0`;
                    break;
            }
            
            values.current.push(option.value);
            optionCells.push(
                <div key={i} className={`${styles.option} ${isDropdown ? styles.extend : ''}`}  style={optionStyles}
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

    const dropdownWrapperStyles: Record<string, string | number> = {};
    const selectStyles: Record<string, string | number> = {
        backgroundColor: dcss.backgroundColor,
        ['--border-radius']: direction === Direction.VERTICAL || !isDropdown ? dcss.borderRadius : `${dcss.borderRadius} 0 0 ${dcss.borderRadius}`,
        color: dcss.whole.color as string,
        padding: dcss.padding,
        border: dcss.border
    };
    const arrowStyles: Record<string, string |number> = {
        border: `solid ${dcss.whole.color}`
    };
    const optionWrapperStyles: Record<string, string | number> = {};

    switch (direction) {
        case Direction.VERTICAL:
            dropdownWrapperStyles.flexDirection = 'column';

            arrowStyles.borderWidth = '0 2px 2px 0';

            optionWrapperStyles.flexDirection = 'column';
            optionWrapperStyles.top = `calc(1.2em + (${dcss.padding} * 2))`;            
            optionWrapperStyles.width = '92%';
            break;
        case Direction.HORIZONTAL:
            arrowStyles.borderWidth = '2px 2px 0 0';
            // option value length + padding left and right value + gap between + arrow size + arrow outline
            optionWrapperStyles.left = `calc(${GetLongestOption()} + (${dcss.padding} * 2) + 0.5rem + (0.2rem * 2) + 2px - 1px)`;
            break;
    }

    return (
        <div className={className} style={dcss.whole}>
            <div className={styles['dropdown-wrapper']} style={dropdownWrapperStyles}>
                <div className={styles.select} style={selectStyles} onClick={() => {setIsDropdown(!isDropdown);}}>
                    <div className={styles['option-value']} style={{width: GetLongestOption()}}>
                    {
                        options[index].option
                    }
                    </div>
                    <div className={`${styles.arrow} ${isDropdown ? styles['arrow-up'] : styles['arrow-down']}`} style={arrowStyles}/>
                </div>
                <div className={styles['option-wrapper']} style={optionWrapperStyles}>
                {
                    RenderOptions()
                }
                </div>
            </div>
        </div>
    );
}