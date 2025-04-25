'use client';
import { AddNewPlayer } from "@/utils/firestore";

interface Test {
    uuid: string
}

export default function Test(props: Test) {
    return (
    <button onClick={() => {
        AddNewPlayer(props.uuid, {
            name: 'GAY',
            score: 5,
            datetime: new Date().toUTCString()
        });
    }}>
        Test
    </button>
    );
}