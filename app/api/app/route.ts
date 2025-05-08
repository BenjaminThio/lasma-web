import db, { AppProps, GetApp, UserProps, Status } from '@/utils/firestore';
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { String2Boolean } from "@/utils/string-formatters";
import { IsValidImage } from "@/utils/image";
import { DeepPartial } from "@/app/components/dropdown/custom-css";
import { GetUser } from '@/app/auth/auth';
import { StrictCheck } from '../utils';
import { ImagePath2Base64 } from '@/utils/image';
import placeholder from './../../../public/images/galaxy.png';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uuid: string | null = searchParams.get('uuid');

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
    else {
        const app: AppProps | null = await GetApp(uuid);

        if (app === null) {
            return new Response(
                JSON.stringify({
                    error: 'App not found.'
                }),
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
        else {
            return new Response(JSON.stringify(app),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
}

export async function POST(request: Request) {
    const user: UserProps | null = await GetUser();

    if (user === null) return new Response(
        JSON.stringify({
            error: 'User not found. Unable to create a new app.'
        }),
        {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    const { searchParams } = new URL(request.url);
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

    const appData: AppProps = {
        ownerUUID: (user as UserProps).info.email,
        isGlobal: JSON.parse((isGlobal as string).toLowerCase()) as boolean,
        info: {
            name: name as string,
            description: description as string,
            status: parseInt(status as string) as Status,
            category: '',
            thumbnail: thumbnail as string,
            tag: parseInt(tag as string),
            platforms: {
                windows: String2Boolean(windows as string) as boolean,
                linux: String2Boolean(linux as string) as boolean,
                macOs: String2Boolean(macOs as string) as boolean,
                android: String2Boolean(android as string) as boolean
            }
        },
        leaderboard: []
    };

    await setDoc(doc(db, 'apps', crypto.randomUUID()), appData);

    return new Response(JSON.stringify(appData), {
        status: 201,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

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
    const thumbnail: string | null = searchParams.get('thumbnail');
    const appProps: DeepPartial<AppProps> = {};

    if (uuid === null) return;
    else {
        const app: AppProps | null = await GetApp(uuid);

        if (app === null) {
            return;
        }
        else {
            if (name !== null) {
                if (appProps.info === undefined) {
                    appProps.info = {};
                }
                appProps.info.name = name;
            };
            if (description !== null) {
                if (appProps.info === undefined) {
                    appProps.info = {};
                }
                appProps.info.description = description;
            };
            if (isGlobal !== null) {
                const value: boolean | undefined = String2Boolean(isGlobal);

                if (value !== undefined) {
                    appProps.isGlobal = value;
                }
            };
            if (status !== null) {
                const value: number = parseInt(status);

                if (!Number.isNaN(value) && value >= 0 && value <= 3) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    appProps.info.status = value;
                }  
            };
            if (tag !== null) {
                const value: number = parseInt(tag);

                if (!Number.isNaN(value) && value >= 0 && value <= 3) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    appProps.info.status = value;
                }
            };
            if (windows !== null) {
                const value: boolean | undefined = String2Boolean(windows);

                if (value !== undefined) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    if (appProps.info.platforms === undefined) {
                        appProps.info.platforms = {};
                    }
                    appProps.info.platforms.windows = value;
                }
            };
            if (linux !== null) {
                const value: boolean | undefined = String2Boolean(linux);

                if (value !== undefined) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    if (appProps.info.platforms === undefined) {
                        appProps.info.platforms = {};
                    }
                    appProps.info.platforms.linux = value;
                }
            };
            if (macOs !== null) {
                const value: boolean | undefined = String2Boolean(macOs);

                if (value !== undefined) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    if (appProps.info.platforms === undefined) {
                        appProps.info.platforms = {};
                    }
                    appProps.info.platforms.macOs = value;
                }
            };
            if (android !== null) {
                const value: boolean | undefined = String2Boolean(android);

                if (value !== undefined) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    if (appProps.info.platforms === undefined) {
                        appProps.info.platforms = {};
                    }
                    appProps.info.platforms.android = value;
                }
            };
            if (thumbnail !== null) {
                if (await IsValidImage(thumbnail)) {
                    if (appProps.info === undefined) {
                        appProps.info = {};
                    }
                    if (appProps.info.platforms === undefined) {
                        appProps.info.platforms = {};
                    }
                    appProps.info.thumbnail = thumbnail;
                }
            }

            await setDoc(doc(db, 'apps', uuid), appProps, {merge: true});
        }
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const appId: string | null = searchParams.get('appId');
    const user: UserProps | null = await GetUser();

    if (user !== null) {
        const apps = user.apps;

        if (appId === null) {
            return new Response(
                JSON.stringify({
                    error: 'The `appId` argument is not provided.'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        } else {
            if (appId in apps) {
                await updateDoc(doc(db, 'users', user.info.email), {
                    apps: apps.filter(appId => appId !== appId)
                });
                await deleteDoc(doc(db, 'apps', appId));
            } else {
                return new Response(
                    JSON.stringify({
                        error: 'App not found.'
                    }),
                    {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
        }
    } else {
        if (user === null) return new Response(
            JSON.stringify({
                error: 'User not found.'
            }),
            {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}

/*
import fs from 'fs';

export async function GET() {
    const data = fs.readFileSync('data/data.json', 'utf-8');
    
    return new Response(data,
    {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const data: Record<string, string | number>[] = JSON.parse(fs.readFileSync('data/data.json', 'utf-8'));

    if (name != null) {
        data.push({name: name, id: 0, score: 0});
        fs.writeFileSync('data/data.json', JSON.stringify(data, null, '\t'), 'utf-8');
    
        return new Response(JSON.stringify(data),
        {
            status: 201,
            headers: {'Content-Type': 'application/json'}
        });
    }
    return new Response(
        JSON.stringify({ error: "Missing 'name' query parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
    );
}
*/
