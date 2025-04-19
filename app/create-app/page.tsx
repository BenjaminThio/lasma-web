'use client';
import AppCard from '../components/apps/app-card';
import { Status } from '@/utils/firestore';

//<div style={{fontSize: 'large'}}>STATUS</div>
export default function CreateAppPage() {
    return (
        <div style={{height: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <AppCard name='Testing123' description='Testing123' status={Status.Ready} scale={2}/>
        </div>
    );
    /*
    return (
        <div className={fusionPixel12px.className} style={{height: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{backgroundColor: '#1b1b1b', width: '25rem', height: '30rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                <h1>CREATE NEW APP</h1>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
                    <div style={{flexGrow: 1, display: 'flex', gap: '1rem'}}>
                        <LightBulb bloomIntensity={0.6} color={lightBulb === 'springgreen' ? lightBulb : ''} scale={7} callback={() => {setLightBulb('springgreen');}}/>
                        <LightBulb bloomIntensity={0.6} color={lightBulb === 'orange' ? lightBulb : ''} scale={7} callback={() => {setLightBulb('orange');}}/>
                        <LightBulb bloomIntensity={0.6} color={lightBulb === 'red' ? lightBulb : ''} scale={7} callback={() => {setLightBulb('red');}}/>
                    </div>
                </div>
                <input placeholder='Name' style={{fontFamily: 'inherit', fontSize: 'large', width: '80%', outline: 'none', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid white', paddingBottom: '0.5rem', marginBottom: '1rem'}}/>
                <input placeholder='Description' style={{fontFamily: 'inherit', fontSize: 'large', width: '80%', outline: 'none', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid white', paddingBottom: '0.5rem'}}/>
                <div style={{width: '80%', flexGrow: 1}}>
                    <span style={{fontSize: 'large'}}>CATEGORY: </span>
                    <select style={{outline: 'none', border: 'none', width: '10ch', borderRadius: '0.5rem', fontFamily: 'inherit', fontSize: 'large', padding: '0.5rem'}}>
                        <option>abcd</option>
                        <option>efgh</option>
                        <option>ijkl</option>
                    </select>
                </div>
                <button>Hello</button>
            </div>
        </div>
    );
    */
}