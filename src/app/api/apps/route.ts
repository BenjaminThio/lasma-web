import { PAGE_SIZE } from '@/lib/constants';
import { getCurrentUser } from '@/server/auth/current-user';
import { badRequest, unauthorized } from '@/server/errors';
import { json, route } from '@/server/http/api';
import { enforce, RATE_LIMITS } from '@/server/security/rate-limit';
import { clientIpFrom } from '@/server/security/request';
import { listOwnedApps, listPublicApps } from '@/server/services/apps';
import { limitSchema, parseInput } from '@/server/validation';

const galleryLimitSchema = limitSchema(PAGE_SIZE.gallery, PAGE_SIZE.apiMax);
const consoleLimitSchema = limitSchema(PAGE_SIZE.console, PAGE_SIZE.apiMax);

/** Paged app listings for the gallery (`scope=public`) and the console (`scope=mine`). */
export const GET = route(async (request) => {
    await enforce(`api:read:${clientIpFrom(request.headers)}`, RATE_LIMITS.apiReadPerIp);

    const params = request.nextUrl.searchParams;
    const scope = params.get('scope') ?? 'public';
    const cursor = params.get('cursor');
    const rawLimit = params.get('limit') ?? undefined;

    if (scope === 'mine') {
        const user = await getCurrentUser();
        if (!user) throw unauthorized('Log in to list your apps.');

        const page = await listOwnedApps(user, cursor, parseInput(consoleLimitSchema, rawLimit));
        return json(page, { cacheControl: 'private, no-store' });
    }

    if (scope !== 'public') throw badRequest('The `scope` argument must be `public` or `mine`.');

    const page = await listPublicApps(cursor, parseInput(galleryLimitSchema, rawLimit));
    return json(page, { cacheControl: 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' });
});
