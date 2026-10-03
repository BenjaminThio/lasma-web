import { LIMITS, PAGE_SIZE, WRITE_KEY_HEADER } from '@/lib/constants';

/*
 * The public API described once, for the landing page's summary and the full /docs page.
 * Keep in sync with src/app/api/leaderboard/route.ts and src/server/security/rate-limit.ts.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const METHOD_STYLES: Record<HttpMethod, string> = {
    GET: 'bg-ready/15 text-ready',
    POST: 'bg-accent/15 text-accent',
    PUT: 'bg-syntax-key/15 text-syntax-key',
    DELETE: 'bg-danger/15 text-danger',
};

export interface EndpointParameter {
    name: string;
    required: boolean;
    description: string;
}

export interface Endpoint {
    method: HttpMethod;
    query: string;
    /** One line for the landing page. */
    summary: string;
    /** The full explanation on /docs. */
    description: string;
    needsWriteKey: boolean;
    parameters: EndpointParameter[];
    /** Status codes a successful call returns. */
    success: string;
    responseHeaders?: string[];
}

const limitParameter = (defaultValue: number): EndpointParameter => ({
    name: 'limit',
    required: false,
    description: `How many rows of the board to return (1–${PAGE_SIZE.apiMax}, default ${defaultValue}).`,
});

export const ENDPOINTS: Endpoint[] = [
    {
        method: 'GET',
        query: '?appId',
        summary: `Read the board, best score first, ${PAGE_SIZE.apiDefault} rows at a time. Pass the X-Next-Cursor header back as \`cursor\` for more.`,
        description:
            'Returns players ordered by score (highest first), then newest id. Pages are cursor-based, so rows never repeat or go missing while scores change between requests.',
        needsWriteKey: false,
        parameters: [
            { name: 'appId', required: true, description: "Your app's ID from the console." },
            limitParameter(PAGE_SIZE.apiDefault),
            {
                name: 'cursor',
                required: false,
                description: 'The `X-Next-Cursor` header from the previous page. Omit it for the first page.',
            },
        ],
        success: '200 with an array of players',
        responseHeaders: [
            '`X-Total-Count`: players on the board (first page only)',
            '`X-Next-Cursor`: cursor for the next page, empty on the last page',
        ],
    },
    {
        method: 'POST',
        query: '?appId&name&score',
        summary: 'Submit a score. Include `playerId` to update that player instead of adding a new row.',
        description:
            'Adds a player, or updates one when `playerId` matches an existing player. Keep the `success.id` from the first response and send it back to update the same player later.',
        needsWriteKey: true,
        parameters: [
            { name: 'appId', required: true, description: "Your app's ID." },
            { name: 'name', required: true, description: `1–${LIMITS.playerName} characters.` },
            { name: 'score', required: true, description: 'A whole number. Negative values are fine.' },
            { name: 'playerId', required: false, description: 'Update this player instead of adding one.' },
            limitParameter(PAGE_SIZE.apiMutationDefault),
        ],
        success: '201 when a player was added, 200 when one was updated',
    },
    {
        method: 'PUT',
        query: '?appId&playerId',
        summary: 'Rename a player, change their score, or both.',
        description: 'Changes an existing player. Send `name`, `score`, or both; the date is refreshed.',
        needsWriteKey: true,
        parameters: [
            { name: 'appId', required: true, description: "Your app's ID." },
            { name: 'playerId', required: true, description: 'The player to change.' },
            { name: 'name', required: false, description: `New name, 1–${LIMITS.playerName} characters.` },
            { name: 'score', required: false, description: 'New score, a whole number.' },
            limitParameter(PAGE_SIZE.apiMutationDefault),
        ],
        success: '200',
    },
    {
        method: 'DELETE',
        query: '?appId&playerId',
        summary: 'Remove a player from the board.',
        description: 'Deletes a player. Players below them move up one place.',
        needsWriteKey: true,
        parameters: [
            { name: 'appId', required: true, description: "Your app's ID." },
            { name: 'playerId', required: true, description: 'The player to remove.' },
            limitParameter(PAGE_SIZE.apiMutationDefault),
        ],
        success: '200 with `success.id` set to the removed player',
    },
];

/** Every parameter in one table, for the landing page. */
export const PARAMETER_SUMMARY: { name: string; usedBy: string; notes: string }[] = [
    { name: 'appId', usedBy: 'All', notes: "Your app's ID from the console." },
    { name: 'name', usedBy: 'POST, PUT', notes: `1–${LIMITS.playerName} characters.` },
    { name: 'score', usedBy: 'POST, PUT', notes: 'A whole number. Negative values are fine.' },
    { name: 'playerId', usedBy: 'PUT, DELETE · optional on POST', notes: 'Returned as `success.id`.' },
    {
        name: 'limit',
        usedBy: 'All',
        notes: `Rows returned. ${PAGE_SIZE.apiDefault} on GET, ${PAGE_SIZE.apiMutationDefault} otherwise, max ${PAGE_SIZE.apiMax}.`,
    },
    { name: 'cursor', usedBy: 'GET', notes: 'From the X-Next-Cursor response header.' },
    { name: WRITE_KEY_HEADER, usedBy: 'POST, PUT, DELETE', notes: "Header carrying the app's write key." },
];

export const ERRORS: { status: number; code: string; meaning: string }[] = [
    {
        status: 400,
        code: 'bad_request',
        meaning: 'A parameter is missing or invalid. The message says which.',
    },
    { status: 401, code: 'unauthorized', meaning: 'The write key is missing or wrong.' },
    { status: 403, code: 'forbidden', meaning: 'The app is set to Disabled and not accepting scores.' },
    { status: 404, code: 'not_found', meaning: 'No app or player with that ID.' },
    { status: 410, code: 'gone', meaning: 'A retired endpoint (app management moved to the console).' },
    { status: 413, code: 'payload_too_large', meaning: 'Request bodies are limited to 16 KB.' },
    { status: 429, code: 'rate_limited', meaning: 'Too many requests. Wait for the `Retry-After` seconds.' },
    { status: 500, code: 'internal', meaning: 'Something failed on our side. Retry with backoff.' },
];

export const RATE_LIMIT_SUMMARY: { scope: string; limit: string }[] = [
    { scope: 'Reads (GET), per IP address', limit: '240 requests a minute' },
    { scope: 'Writes (POST, PUT, DELETE), per IP address and app', limit: '60 requests a minute' },
];

/** Renders `inline code` spans inside short descriptions. */
export function splitInlineCode(text: string): { code: boolean; text: string }[] {
    return text
        .split(/(`[^`]+`)/g)
        .filter(Boolean)
        .map((part) =>
            part.startsWith('`') ? { code: true, text: part.slice(1, -1) } : { code: false, text: part },
        );
}
