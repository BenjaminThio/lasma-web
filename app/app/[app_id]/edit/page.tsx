'use client';
import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import EditableAppCard from '../../../components/apps/editable-app-card';
import { GetApp, AppProps } from '@/utils/firestore';
import { useEffect, useRef, use, useState, JSX } from 'react';

interface ParamsProps {
    params: Promise<{app_id: string}>;
}

const fusionPixel12px: NextFont = localFont({
    src: './../../../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function EditAppPage({params}: ParamsProps) {
    const {app_id}: Record<string, string> = use(params);
    const appRef = useRef<AppProps | null>(null);
    const [appCard, setAppCard] = useState<JSX.Element>();

    useEffect(() => {
        async function FetachApp() {
            appRef.current = await GetApp(app_id);
            const app = appRef.current;

            if (app !== null) {
                setAppCard(<EditableAppCard updateOnlyAppId={app_id} defaultName={app.info.name} defaultDescription={app.info.description} defaultStatus={app.info.status} defaultThumbnail={app.info.thumbnail} defaultPlatforms={{windows: app.info.platforms.windows, linux: app.info.platforms.linux, macOs: app.info.platforms.macOs, android: app.info.platforms.android}} defaultTag={app.info.tag}/>);
            }
        }

        FetachApp();
    }, []);

    return (
        <div style={{height: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
            {
                appCard
            }
            <div className={fusionPixel12px.className} style={{position: 'absolute', left: 0, fontSize: '5rem', padding: '1rem', border: '2px solid white', borderRadius: '1rem', margin: '1rem'}}>E<br/>D<br/>I<br/>T</div>
        </div>
    );
}
