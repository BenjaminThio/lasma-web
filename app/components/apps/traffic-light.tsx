import type { JSX } from 'react';
import styles from './apps.module.css';
import LightBulb from './light-bulb';
import { Status } from '@/utils/firestore';

interface TrafficLightProps {
    status: Status;
}

export default function TrafficLight(props: TrafficLightProps): JSX.Element {
    return (
    <div className={styles['traffic-light-container']}>
        <LightBulb color={props.status == Status.Ready ? 'springgreen' : ''}/>
        <LightBulb color={props.status == Status.UnderConstruction ? 'orange' : ''}/>
        <LightBulb color={props.status == Status.Disabled ? 'red' : ''}/>
    </div>
    );
}