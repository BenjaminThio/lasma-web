import { setDoc, doc } from 'firebase/firestore';
import db from '@/utils/firestore';
import { ImagePath2Base64 } from '@/utils/image';
import { String2Boolean } from '@/utils/string-formatters';
import placeholder from './../../../public/images/galaxy.png';
import { StrictCheck } from '../../utils';
import { Status, GetApp } from '@/utils/firestore';

export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const uuid: string | null = searchParams.get('uuid');
    const name: string | null = searchParams.get('name');
    const description: string | null = searchParams.get('description');
    const isGlobal: string | null = searchParams.get('isGlobal');
    const status: string | null = searchParams.get('status');
    const tag: string | null = searchParams.get('tag');
    const windows: string | null = searchParams.get('windows');
    const linux: string | null = searchParams.get('linux');
    const macOs: string | null = searchParams.get('macOs');
    const android: string | null = searchParams.get('android');
    let thumbnail: string | null = searchParams.get('thumbnail');

    if (uuid === null) return new Response(
        JSON.stringify({
            error: 'The `uuid` argument is not provided.'
        }),
        {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    const errorMessages: string[] = await StrictCheck({name, description, isGlobal, status, tag, thumbnail, windows, linux, macOs, android});

    if (errorMessages.length > 0) {
        return new Response(
            JSON.stringify({
                error: errorMessages.join('\n')
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    if (thumbnail === null) thumbnail = await ImagePath2Base64(placeholder.src);

    const appData = {
        isGlobal: String2Boolean(isGlobal as string) as boolean,
        info: {
            name: name as string,
            description: description as string,
            status: parseInt(status as string) as Status,
            thumbnail: thumbnail as string,
            tag: parseInt(tag as string)
        },
        platforms: {
            windows: String2Boolean(windows as string) as boolean,
            linux: String2Boolean(linux as string) as boolean,
            macOs: String2Boolean(macOs as string) as boolean,
            android: String2Boolean(android as string) as boolean
        }
    };

    await setDoc(doc(db, 'apps', uuid), appData, {merge: true});

    return new Response(JSON.stringify(await GetApp(uuid)), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}