import type { JSX } from 'react';

interface RowContainerProps {
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    field6: string;
    field7: string;
}

export default function Row(props: RowContainerProps): JSX.Element {
    return (
    <>
        <div style={{width: '4ch', marginLeft: '1rem'}}>{props.field1}</div>
        <div style={{width: '25ch'}}>{props.field2}</div>
        <div style={{width: '39%'}}>{props.field3}</div>
        <div style={{flexGrow: 1, textAlign: 'center'}}>{props.field4}</div>
        <div style={{flexGrow: 1, textAlign: 'center'}}>{props.field5}</div>
        <div style={{flexGrow: 1, textAlign: 'center'}}>{props.field6}</div>
        <div style={{flexGrow: 1, textAlign: 'center'}}>{props.field7}</div>
    </>
    );
};