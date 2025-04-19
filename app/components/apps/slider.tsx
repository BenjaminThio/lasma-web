import { type JSX, ChangeEvent } from 'react';
import styles from './page.module.css';

export interface SliderProps {
    name: string;
    minValue: number;
    maxValue: number;
    value: number;
    callback: (value: number) => void;
    step?: number;
}

export default function Slider({name, minValue, maxValue, value, callback, step=1}: SliderProps): JSX.Element {
    const maxInputValue: number = maxValue.toString().length;
    const stepValueLength: number = step.toString().length;
    const maxInputLength: number = maxInputValue > stepValueLength ? maxInputValue : stepValueLength;

    return (
    <tr>
        <td>
            {name}
        </td>
        <td>
            <input
                type='range'
                min={minValue}
                max={maxValue}
                //defaultValue={defaultValue}
                step={step}
                value={value}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const sliderValue: number = parseFloat(event.currentTarget.value);

                    callback(sliderValue);
            }}/>
        </td>
        <td>
            <input className={styles.input} type='text' maxLength={maxInputLength} /*defaultValue={defaultValue}*/ value={value} style={{width: `${maxInputLength}ch`}} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const input: EventTarget & HTMLInputElement = event.currentTarget;
                let inputValue: number;

                if (input.value === '') {
                    inputValue = minValue;
                }
                else {
                    inputValue = parseFloat(input.value);

                    if (inputValue > maxValue) {
                        inputValue = maxValue;
                    }
                }

                callback(inputValue);
            }}/>
        </td>
    </tr>
    );
}
