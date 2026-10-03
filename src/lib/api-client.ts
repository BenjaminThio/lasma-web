import type { AppSummary, Page, Player } from './domain';

async function request<T>(url: string, signal?: AbortSignal): Promise<{ data: T; response: Response }> {
    const response = await fetch(url, {
        signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const body: unknown = await response.json();
            if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
                message = body.error;
            }
        } catch {
            // Non-JSON error body: keep the generic message.
        }

        throw new Error(message);
    }

    return { data: (await response.json()) as T, response };
}

export async function fetchLeaderboardPage(
    appId: string,
    cursor: string | null,
    limit: number,
    signal?: AbortSignal,
): Promise<Page<Player>> {
    const params = new URLSearchParams({ appId, limit: String(limit) });
    if (cursor) params.set('cursor', cursor);

    const { data, response } = await request<Player[]>(`/api/leaderboard?${params}`, signal);

    return { items: data, nextCursor: response.headers.get('X-Next-Cursor') || null };
}

export async function fetchAppsPage(
    scope: 'public' | 'mine',
    cursor: string | null,
    limit: number,
    signal?: AbortSignal,
): Promise<Page<AppSummary>> {
    const params = new URLSearchParams({ scope, limit: String(limit) });
    if (cursor) params.set('cursor', cursor);

    const { data } = await request<Page<AppSummary>>(`/api/apps?${params}`, signal);

    return data;
}
