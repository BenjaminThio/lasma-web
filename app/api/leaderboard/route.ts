import db, { AppProps, GetApp, PlayerProps } from "@/utils/firestore";
import { String2Boolean } from "@/utils/string-formatters";
import { doc, updateDoc } from "firebase/firestore";

// Get Data

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const appId: string | null = searchParams.get('appId');

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
        const app: AppProps | null = await GetApp(appId);

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
        } else {
            return new Response(
                JSON.stringify(app.leaderboard),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    }
}

// Register

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const appId: string | null = searchParams.get('appId');

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
        let app: AppProps | null = await GetApp(appId);

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
        } else {
            const playerName: string | null = searchParams.get('name');

            if (playerName === null) {
                return new Response(
                    JSON.stringify({
                        error: 'The `name` argument is not provided.'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else if (playerName.length === 0 && playerName.length > 30) {
                return new Response(
                    JSON.stringify({
                        error: 'The `name` must be at least `1` characters and no more than `30` characters.'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            const safe: string = searchParams.get('safe') ?? 'true';

            if (safe !== null && String2Boolean(safe) === undefined) {
                return new Response(
                    JSON.stringify({
                        error: 'The `safe` argument must be a valid boolean value: true / false'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            const playerScore: string | null = searchParams.get('score');

            if (playerScore === null) {
                return new Response(
                    JSON.stringify({
                        error: 'The `score` argument is not provided.'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } 
            if (Number.isNaN(parseInt(playerScore))) {
                return new Response(
                    JSON.stringify({
                        error: 'The provided `score` argument must be an integer (both positive and negative values are accepted).'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            if (String2Boolean(safe)) {
                if (parseInt(playerScore) < Number.MIN_SAFE_INTEGER || parseInt(playerScore) > Number.MAX_SAFE_INTEGER) {
                    return new Response(
                        JSON.stringify({
                            error: `The provided \`score\` argument must be within the range of ${Number.MIN_SAFE_INTEGER} to ${Number.MAX_SAFE_INTEGER}.`
                        }),
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }

            let playerId: string | null = searchParams.get('playerId');

            if (playerId === null) {
                const tempPlayerId: string = crypto.randomUUID();

                if (!(tempPlayerId in app.leaderboard)) {
                    playerId = tempPlayerId;
                }
            }
            
            const playerProps: PlayerProps = {
                name: playerName,
                score: parseInt(playerScore),
                datetime: new Date().toUTCString()
            };

            await updateDoc(doc(db, 'apps', appId), {
                [`leaderboard.${playerId}`]:  playerProps
            });

            app = await GetApp(appId);

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

            return new Response(
                JSON.stringify({
                    success: {...playerProps, id: playerId},
                    leaderboard: app.leaderboard
                }),
                {
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    }
}

// Edit

export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const appId: string | null = searchParams.get('appId');

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
        let app: AppProps | null = await GetApp(appId);

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
        } else {
            const playerId: string | null = searchParams.get('playerId');

            if (playerId === null) {
                return new Response(
                    JSON.stringify({
                        error: 'The `playerId` argument is not provided.'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                if (!(playerId in app.leaderboard)) {
                    return new Response(
                        JSON.stringify({
                            error: 'Player not found.'
                        }),
                        {
                            status: 404,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } else {
                    const newPlayerName: string | null = searchParams.get('name');

                    if (newPlayerName === null) {
                        return new Response(
                            JSON.stringify({
                                error: 'The `name` argument is not provided.'
                            }),
                            {
                                status: 400,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } else if (newPlayerName.length === 0 || newPlayerName.length > 30) {
                        return new Response(
                            JSON.stringify({
                                error: 'The `name` must be at least `1` characters and no more than `30` characters.'
                            }),
                            {
                                status: 400,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    }

                    const safe: string = searchParams.get('safe') ?? 'true';

                    if (safe !== null && String2Boolean(safe) === undefined) {
                        return new Response(
                            JSON.stringify({
                                error: 'The `safe` argument must be a valid boolean value: true / false'
                            }),
                            {
                                status: 400,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    }

                    const newPlayerScore: string | null = searchParams.get('score');

                    if (newPlayerScore === null) {
                        return new Response(
                            JSON.stringify({
                                error: 'The `score` argument is not provided.'
                            }),
                            {
                                status: 400,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } 
                    if (Number.isNaN(parseInt(newPlayerScore))) {
                        return new Response(
                            JSON.stringify({
                                error: 'The provided `score` argument must be an integer (both positive and negative values are accepted).'
                            }),
                            {
                                status: 400,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    }
                    if (String2Boolean(safe)) {
                        if (parseInt(newPlayerScore) < Number.MIN_SAFE_INTEGER || parseInt(newPlayerScore) > Number.MAX_SAFE_INTEGER) {
                            return new Response(
                                JSON.stringify({
                                    error: `The provided \`score\` argument must be within the range of ${Number.MIN_SAFE_INTEGER} to ${Number.MAX_SAFE_INTEGER}.`
                                }),
                                {
                                    status: 400,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                        }
                    }

                    const playerProps: PlayerProps = {
                        name: newPlayerName,
                        score: parseInt(newPlayerScore),
                        datetime: new Date().toUTCString()
                    };

                    await updateDoc(doc(db, 'apps', appId), {
                        [`leaderboard.${playerId}`]:  playerProps
                    });

                    app = await GetApp(appId);

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
        
                    return new Response(
                        JSON.stringify({
                            success: {...playerProps, id: playerId},
                            leaderboard: app.leaderboard
                        }),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }
        }
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const appId: string | null = searchParams.get('appId');

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
        let app: AppProps | null = await GetApp(appId);

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
        } else {
            const playerId: string | null = searchParams.get('playerId');

            if (playerId === null) {
                return new Response(
                    JSON.stringify({
                        error: 'The `playerId` argument is not provided.'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                if (!(playerId in app.leaderboard)) {
                    return new Response(
                        JSON.stringify({
                            error: 'Player not found.'
                        }),
                        {
                            status: 404,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } else {
                    delete app.leaderboard[playerId];

                    await updateDoc(doc(db, 'apps', appId), {
                        leaderboard: app.leaderboard
                    });

                    app = await GetApp(appId);

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
        
                    return new Response(
                        JSON.stringify({
                            success: {id: playerId},
                            leaderboard: app.leaderboard
                        }),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }
        }
    }
}