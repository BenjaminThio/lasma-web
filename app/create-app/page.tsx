import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import EditableAppCard from '../components/apps/editable-app-card';

const fusionPixel12px: NextFont = localFont({
    src: './../../public/fonts/fusion-pixel-12px-monospaced-zh_hans.otf'
});

export default function CreateAppPage() {
    return (
        <div style={{height: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
            <EditableAppCard/>
            <div className={fusionPixel12px.className} style={{position: 'absolute', left: 0, fontSize: '5rem', padding: '1rem', border: '2px solid white', borderRadius: '1rem', margin: '1rem'}}>E<br/>D<br/>I<br/>T</div>
        </div>
    );
}