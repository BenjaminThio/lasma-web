'use client';

import { LogOut } from "../auth/auth";

export default function LogOutC() {
    return (
        <div style={{padding: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white'}}
        onClick={
            () => {
                LogOut();
            }
        }>
            Log Out
        </div>
    );
}