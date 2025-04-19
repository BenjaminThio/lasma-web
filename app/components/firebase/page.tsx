'use client';
import { JSX, useRef } from 'react';
import { CreateNewApp, Status, UpdateApp } from '@/utils/firestore';

export default function FirebaseTestPage(): JSX.Element {
    const uuid = useRef<string | null>(null);

    return (
        <div style={{
            height: '100svh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <button onClick={async () => {
                uuid.current = crypto.randomUUID();
                await CreateNewApp(uuid.current, {
                    ownerUUID: '',
                    isGlobal: false,
                    info: {
                        name: 'Lasma Studio',
                        description: 'Testing123',
                        category: 'Role Playing',
                        status: Status.Ready,
                        thumbnail: ''
                    },
                    leaderboard: {}
                });
            }}>Create New App</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'info.name', 'Lasma Studio2');
            }}>Update Name</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'info.description', 'Testing1234');
            }}>Update Description</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'info.category', 'GAY');
            }}>Update Category</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'isGlobal', true);
            }}>Update Is Global</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'ownerUUID', 'user_123');
            }}>Update Owner UUID</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'info.status', Status.UnderConstruction);
            }}>Update Status To Under Construction</button>
            <button onClick={async () => {
                await UpdateApp(uuid.current as string, 'info.status', Status.Disabled);
            }}>Update Status To Disabled</button>
        </div>
    );
}