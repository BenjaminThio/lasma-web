import { db } from '@/server/db';
import { gone, notFound } from '@/server/errors';
import { json, preflight, route } from '@/server/http/api';
import { enforce, RATE_LIMITS } from '@/server/security/rate-limit';
import { clientIpFrom } from '@/server/security/request';
import { thumbnailUrl } from '@/server/services/apps';
import { identifierSchema, parseInput } from '@/server/validation';

const uuidSchema = identifierSchema('uuid');

export function OPTIONS() {
    return preflight();
}

/** Legacy: public details of one app. No longer exposes the owner, the leaderboard or base64 images. */
export const GET = route(
    async (request) => {
        await enforce(`api:read:${clientIpFrom(request.headers)}`, RATE_LIMITS.apiReadPerIp);

        const appId = parseInput(uuidSchema, request.nextUrl.searchParams.get('uuid'));
        const app = await db().apps.find(appId);
        if (!app) throw notFound('App not found.');

        return json(
            { id: app.id, isGlobal: app.isGlobal, info: { ...app.info, thumbnail: thumbnailUrl(app) } },
            { cors: true },
        );
    },
    { cors: true },
);

/** App management moved to the console (Server Actions with session auth and ownership checks). */
const retired = route(
    async () => {
        throw gone('This endpoint has been retired. Create and manage apps from the console at /console.');
    },
    { cors: true },
);

export const POST = retired;
export const PUT = retired;
export const DELETE = retired;
