import { Color } from '@/utils/color';
import { CSSProperties } from 'react';
import { deepMerge } from '@/utils/record';

export interface DCSS {
    whole: CSSProperties;
    backgroundColor: Color;
    border: string;
    borderRadius: string;
    padding: string;
    option: {
        border: string;
        hovered: {
            backgroundColor: Color;
        };
        selected: {
            backgroundColor: Color;
        };
    };
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]> : T[P];
};
export type DCSSProps = DeepPartial<DCSS>;

export const defaultStyleSheets: DCSS = {
    whole: {
        color: 'black'
    },
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    /*select: {
        backgroundColor: 'white'
    },*/
    option: {
        border: 'none',
        hovered: {
            backgroundColor: 'lightskyblue'
        },
        selected: {
            backgroundColor: 'lightgreen'
        },
    }
};

export function MergeDCSS(style?: DCSSProps): DCSS {
    if (style !== undefined) {
        return deepMerge(defaultStyleSheets, style) as DCSS;
    }
    else {
        return defaultStyleSheets;
    }
}