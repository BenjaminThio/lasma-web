import 'server-only';
import type { NextRequest } from 'next/server';
import { WRITE_KEY_HEADER } from '@/lib/constants';
import { AppError, badRequest, payloadTooLarge } from '@/server/errors';
import { logger } from '@/server/logger';

const MAX_BODY_BYTES = 16 * 1024;

/** The public API is called from game clients on any origin; it never uses cookies. */
export const PUBLIC_CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': `Content-Type, ${WRITE_KEY_HEADER}`,
    'Access-Control-Expose-Headers': 'X-Total-Count, X-Next-Cursor, X-RateLimit-Remaining, Retry-After',
    'Access-Control-Max-Age': '86400',
};

interface ResponseOptions {
    status?: number;
    headers?: Record<string, string>;
    cors?: boolean;
    /** Defaults to `no-store`: API data is live unless a route opts into caching. */
    cacheControl?: string;
}

export function json(data: unknown, options: ResponseOptions = {}): Response {
    return Response.json(data, {
        status: options.status ?? 200,
        headers: {
            'Cache-Control': options.cacheControl ?? 'no-store',
            'X-Content-Type-Options': 'nosniff',
            ...(options.cors ? PUBLIC_CORS_HEADERS : {}),
            ...options.headers,
        },
    });
}

export function preflight(): Response {
    return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
}

export function errorResponse(error: unknown, cors: boolean): Response {
    if (error instanceof AppError) {
        return json(
            { error: error.message, code: error.code },
            { status: error.status, headers: error.headers, cors },
        );
    }

    logger.error('Unhandled API error', { error });
    return json({ error: 'Something went wrong on our side.', code: 'internal' }, { status: 500, cors });
}

type Handler<Context> = (request: NextRequest, context: Context) => Promise<Response>;

/** Wraps a route handler so every failure becomes a consistent JSON error. */
export function route<Context>(
    handler: Handler<Context>,
    options: { cors?: boolean } = {},
): Handler<Context> {
    return async (request, context) => {
        try {
            return await handler(request, context);
        } catch (error) {
            return errorResponse(error, options.cors ?? false);
        }
    };
}

export interface RequestInput {
    get(name: string): string | null;
}

/**
 * Parameters from the query string, merged with a JSON or form body when present. Game engines
 * make different things easy, so all three are accepted (body values win over the query string).
 */
export async function readInput(request: NextRequest): Promise<RequestInput> {
    const values = new Map<string, string>(request.nextUrl.searchParams);
    const contentType = request.headers.get('content-type') ?? '';
    const declaredLength = Number(request.headers.get('content-length') ?? 0);

    if (declaredLength > MAX_BODY_BYTES) throw payloadTooLarge('Request bodies are limited to 16 KB.');

    if (request.method !== 'GET' && request.body) {
        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) throw payloadTooLarge('Request bodies are limited to 16 KB.');

        if (raw.trim().length > 0 && contentType.includes('application/json')) {
            let body: unknown;
            try {
                body = JSON.parse(raw);
            } catch {
                throw badRequest('The request body is not valid JSON.');
            }
            if (body && typeof body === 'object' && !Array.isArray(body)) {
                for (const [key, value] of Object.entries(body)) {
                    if (
                        typeof value === 'string' ||
                        typeof value === 'number' ||
                        typeof value === 'boolean'
                    ) {
                        values.set(key, String(value));
                    }
                }
            }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            for (const [key, value] of new URLSearchParams(raw)) values.set(key, value);
        }
    }

    return { get: (name) => values.get(name) ?? null };
}
