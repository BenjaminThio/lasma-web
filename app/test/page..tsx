'use client';
import type { JSX } from 'react';
import TrafficLightCell from '../components/apps/light-bulb';

export default function TestPage(): JSX.Element {
    function ParseColor(color: string): number[] {
        const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        ctx.fillStyle = color;
        return HexToRgb(ctx.fillStyle);
    }

    function HexToRgb(hex: string): number[] {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return [r, g, b];
    }

    return (
    <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <TrafficLightCell color='red'/>
        <button onClick={() => console.log(ParseColor('red'))}>
            Test
        </button>
    </div>
    );
}