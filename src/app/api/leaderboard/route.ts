import type { NextRequest } from 'next/server';
import { PAGE_SIZE, WRITE_KEY_HEADER } from '@/lib/constants';
import { db } from '@/server/db';
import { badRequest, notFound } from '@/server/errors';
import { json, preflight, readInput, route, type RequestInput } from '@/server/http/api';
import { enforce, RATE_LIMITS } from '@/server/security/rate-limit';
import { clientIpFrom } from '@/server/security/request';
import {
    assertCanWrite,
    countPlayers,
    editPlayer,
    getLeaderboardPage,
    removePlayer,
    submitScore,
} from '@/server/services/leaderboard';
import {
    identifierSchema,
    limitSchema,
    parseInput,
    playerNameSchema,
    scoreSchema,
} from '@/server/validation';

/*
 * Public leaderboard API, called directly from games.
 *
 *   GET    ?appId[&limit&cursor]                 → Player[]  (X-Total-Count, X-Next-Cursor headers)
 *   POST   ?appId&name&score[&playerId]          → { success, leaderboard }  201 created / 200 updated
 *   PUT    ?appId&playerId[&name][&score]        → { success, leaderboard }
 *   DELETE ?appId&playerId                       → { success: { id }, leaderboard }
 *
 * Parameters may also be sent as a JSON or form body. Writes need the app's write key in the
 * `X-Api-Key` header (apps created before write keys existed are exempt until a key is generated).
 */

const appIdSchema = identifierSchema('appId');
const playerIdSchema = identifierSchema('playerId');
const readLimitSchema = limitSchema(PAGE_SIZE.apiDefault, PAGE_SIZE.apiMax);
const responseLimitSchema = limitSchema(PAGE_SIZE.apiMutationDefault, PAGE_SIZE.apiMax);

function optionalParam(input: RequestInput, name: string): string | undefined {
    return input.get(name) ?? undefined;
}

/** Shared preamble for every write: validate the app id, rate-limit, then check key and status. */
async function authorizeWrite(request: NextRequest) {
    const input = await readInput(request);
    const appId = parseInput(appIdSchema, input.get('appId'));
    const rate = await enforce(
        `api:write:${clientIpFrom(request.headers)}:${appId}`,
        RATE_LIMITS.apiWritePerIpAndApp,
    );

    const app = await db().apps.findWithSecrets(appId);
    if (!app) throw notFound('App not found.');

    assertCanWrite(app, request.headers.get(WRITE_KEY_HEADER) ?? input.get('key'));

    return { input, appId, headers: { 'X-RateLimit-Remaining': String(rate.remaining) } };
}

async function topOfBoard(appId: string, input: RequestInput) {
    const limit = parseInput(responseLimitSchema, optionalParam(input, 'limit'));
    return (await getLeaderboardPage(appId, null, limit)).items;
}

export function OPTIONS() {
    return preflight();
}

export const GET = route(
    async (request) => {
        const rate = await enforce(`api:read:${clientIpFrom(request.headers)}`, RATE_LIMITS.apiReadPerIp);
        const input = await readInput(request);
        const appId = parseInput(appIdSchema, input.get('appId'));
        const limit = parseInput(readLimitSchema, optionalParam(input, 'limit'));
        const cursor = input.get('cursor');

        if (!(await db().apps.find(appId))) throw notFound('App not found.');

        // The total is only counted for the first page; later pages already know it.
        const [page, total] = await Promise.all([
            getLeaderboardPage(appId, cursor, limit),
            cursor ? Promise.resolve(null) : countPlayers(appId),
        ]);

        return json(page.items, {
            cors: true,
            headers: {
                'X-Next-Cursor': page.nextCursor ?? '',
                'X-RateLimit-Remaining': String(rate.remaining),
                ...(total === null ? {} : { 'X-Total-Count': String(total) }),
            },
        });
    },
    { cors: true },
);

export const POST = route(
    async (request) => {
        const { input, appId, headers } = await authorizeWrite(request);
        const name = parseInput(playerNameSchema, input.get('name'));
        const score = parseInput(scoreSchema, input.get('score'));
        const rawPlayerId = input.get('playerId');
        const playerId = rawPlayerId ? parseInput(playerIdSchema, rawPlayerId) : null;

        const { player, created } = await submitScore(appId, { playerId, name, score });

        return json(
            { success: player, leaderboard: await topOfBoard(appId, input) },
            { status: created ? 201 : 200, cors: true, headers },
        );
    },
    { cors: true },
);

export const PUT = route(
    async (request) => {
        const { input, appId, headers } = await authorizeWrite(request);
        const playerId = parseInput(playerIdSchema, input.get('playerId'));
        const rawName = input.get('name');
        const rawScore = input.get('score');

        if (rawName === null && rawScore === null) {
            throw badRequest('Provide a new `name`, a new `score`, or both.');
        }

        const player = await editPlayer(appId, playerId, {
            name: rawName === null ? undefined : parseInput(playerNameSchema, rawName),
            score: rawScore === null ? undefined : parseInput(scoreSchema, rawScore),
        });

        return json(
            { success: player, leaderboard: await topOfBoard(appId, input) },
            { cors: true, headers },
        );
    },
    { cors: true },
);

export const DELETE = route(
    async (request) => {
        const { input, appId, headers } = await authorizeWrite(request);
        const playerId = parseInput(playerIdSchema, input.get('playerId'));

        await removePlayer(appId, playerId);

        return json(
            { success: { id: playerId }, leaderboard: await topOfBoard(appId, input) },
            { cors: true, headers },
        );
    },
    { cors: true },
);
