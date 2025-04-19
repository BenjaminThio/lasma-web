import type { JSX } from 'react';

interface RowContainerProps {
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
}

export default function Row(props: RowContainerProps): JSX.Element {
    return (
    <>
        <div style={{width: '10%', marginLeft: '1rem'}}>{props.field1}</div>
        <div style={{width: '30%'}}>{props.field2}</div>
        <div style={{width: '20%', textAlign: 'center'}}>{props.field3}</div>
        <div style={{width: '20%', textAlign: 'center'}}>{props.field4}</div>
        <div style={{width: '20%', textAlign: 'center'}}>{props.field5}</div>
    </>
    );
};