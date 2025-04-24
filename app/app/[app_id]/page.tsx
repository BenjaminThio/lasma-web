//'use client;'
//import { use } from 'react';

interface ParamsProps {
    params: Promise<{app_id: string}>;
}

/*
export default function AppPage({params}: ParamsProps) {
    const {app_id} = use(params);

    return (
        <div>
            App ID: {app_id}
        </div>
    );
}
*/

export default async function AppPage({params}: ParamsProps) {
    const {app_id}: Record<string, string> = await params;

    return (
        <div>
            App ID: {app_id}
        </div>
    );
}
