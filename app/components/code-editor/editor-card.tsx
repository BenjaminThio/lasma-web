import {type JSX} from 'react';
import JsonLogo from './../../../public/json.png';
import Cross from './../../../public/cross.png';
import Image from 'next/image';
import LightBulb from '../apps/light-bulb';

const DATA = {
    "success": {
        "name": "Benjamin Thio",
        "score": 999,
        "datetime": "Tue, 28 Oct 2025 07:00:12 GMT",
        "id": "4572ab60-9ee1-43fa-b364-37046a00e5e1"
    },
    "leaderboard": [
        {
            "name": "Benjamin Thio",
            "score": 999,
            "datetime": "Tue, 28 Oct 2025 07:00:12 GMT",
            "id": "4572ab60-9ee1-43fa-b364-37046a00e5e1"
        },
        {
            "datetime": "Wed, 21 May 2025 15:28:23 GMT",
            "score": 80,
            "name": "Teh Yi Fan",
            "id": "ba9ebdf3-6378-41d8-89e9-5888129b7296"
        },
        {
            "id": "e17dfa31-77fa-4174-96be-4ed909f603eb",
            "name": "Loh Zen Thye",
            "datetime": "Thu, 08 May 2025 16:44:48 GMT",
            "score": 7
        },
        {
            "score": 5,
            "datetime": "Thu, 08 May 2025 16:44:51 GMT",
            "name": "Law Choon Hong",
            "id": "b98bbe22-122c-471f-a1ff-6bbb5f726bab"
        }
    ]
};

function DisplayCode(data: any): Array<JSX.Element> {
    const display: Array<JSX.Element> = [];
    const splitData = JSON.stringify(data, null, 2).split('\n');

    for (let i: number = 0; i < splitData.length; i++) {
        display.push(
            <div style={{display: 'flex'}} key={i}>
                <div style={{paddingRight: '0.7rem', color: 'gray'}}>
                    { i }
                </div>
                <div style={{whiteSpace: 'pre'}}>
                    { splitData[i] }
                </div>
            </div>
        );
    }

    return display;
}

export default function EditorCard() {
    return (
    <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '50svw',
            borderRadius: '0.5rem',
            overflow: 'clip',
            boxShadow: 'inset 0 0 0.5rem 0.3rem rgb(255, 255, 255, 0.3)',
            marginBottom: '10rem',
            paddingBottom: '1.5rem'
        }}>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        }}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{
                    backgroundColor: 'rgba(31,31,31,0.9)',
                    padding: '0.7rem',
                    borderRadius: '0.5rem 0.3rem 0 0',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '0.5rem',
                    borderBottom: '2px solid #181818',
                    alignItems: 'center'
                }}>
                    <Image src={JsonLogo} alt="json" style={{height: '17px', width: '17px'}}/>
                    <div>
                        test.json
                    </div>
                    <LightBulb color='springgreen'/>
                    <Image src={Cross} alt="cross" style={{paddingLeft: '0.3rem', height: '10px', width: '10px'}}/>
                </div>
            </div>
            <Image src={Cross} alt="cross" style={{height: '10px', width: '10px', alignSelf: 'center', paddingRight: '0.9rem'}}/>
        </div>
        <div style={{
            backgroundColor: 'rgba(31,31,31,0.9)',
            minHeight: '50svh',
            padding: '0.7rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            {
                DisplayCode(DATA)
                /*
                <div style={{display: 'flex'}}>
                    <div style={{paddingRight: '0.7rem', color: 'gray'}}>
                        1
                    </div>
                    <div>
                        { '{' }
                    </div>
                </div>
                <div style={{display: 'flex'}}>
                    <div style={{paddingRight: '0.7rem', color: 'gray'}}>
                        2
                    </div>
                    <div>
                        <span style={{display: 'inline-block', minWidth: '2ch', backgroundColor: 'cyan'}}/>
                        <span style={{color: 'lightskyblue'}}>
                            { '"name"' }
                        </span>
                        <span>
                            :
                        </span>
                        <span style={{color: 'burlywood'}}>
                            { ' "Benjamin"' }
                        </span>
                    </div>
                </div>
                */
            }
        </div>
    </div>
    );
}