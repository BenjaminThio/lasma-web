'use client';
import type { JSX } from 'react';

export default function Button(): JSX.Element {
    return (
        <button onClick={() => console.log("GAY!")}>
            Click Me!
        </button>
    );
};