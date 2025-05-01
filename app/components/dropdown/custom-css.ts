import { Color } from '@/utils/color';
import { CSSProperties } from 'react';

export interface DCSSProperties {
    whole?: CSSProperties
    backgroundColor?: Color;
    border?: string;
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

export interface DCSS {
    whole: CSSProperties
    backgroundColor: Color;
    border: string;
    borderRadius: string;
    padding: string;
    option: {
        hovered: {
            backgroundColor: Color
        };
        selected: {
            backgroundColor: Color
        }
    }
}

export function MergeDCSS(style?: DCSSProperties): DCSS {
    const defaultStyleSheets: DCSS = {
        whole: {
            color: 'black'
        },
        backgroundColor: 'white',
        border: 'unset',
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
        return {...defaultStyleSheets, ...style} as DCSS;
    }
    else {
        return defaultStyleSheets;
    }
}