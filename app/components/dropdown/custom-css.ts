import { Color } from '@/utils/color';
import { CSSProperties } from 'react';


export interface DCSSProperties {
    whole?: CSSProperties
    backgroundColor?: Color;
    borderRadius?: string;
    padding?: string;
    /*select?: {
        backgroundColor?: Color;
    };*/
    option?: {
        hovered?: {
            backgroundColor?: Color
        };
        selected?: {
            backgroundColor?: Color
        }
    }
}

export function MergeDCSS(style?: DCSSProperties): DCSSProperties {
    const defaultStyleSheets: DCSSProperties = {
        whole: {
            color: 'black'
        },
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        option: {
            hovered: {
                backgroundColor: 'lightskyblue'
            },
            selected: {
                backgroundColor: 'lightgreen'
            },
        }
    };
    if (style !== undefined) {
        return {...defaultStyleSheets, ...style};
    }
    else {
        return defaultStyleSheets;
    }
}