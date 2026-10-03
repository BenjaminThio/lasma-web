import 'server-only';

export type ErrorCode =
    | 'bad_request'
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'gone'
    | 'payload_too_large'
    | 'rate_limited'
    | 'internal';

/** An error that is safe to show to the caller. Anything else is reported as a generic 500. */
export class AppError extends Error {
    constructor(
        readonly status: number,
        readonly code: ErrorCode,
        message: string,
        readonly headers?: Record<string, string>,
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const badRequest = (message: string) => new AppError(400, 'bad_request', message);
export const unauthorized = (message: string) => new AppError(401, 'unauthorized', message);
export const forbidden = (message: string) => new AppError(403, 'forbidden', message);
export const notFound = (message: string) => new AppError(404, 'not_found', message);
export const conflict = (message: string) => new AppError(409, 'conflict', message);
export const gone = (message: string) => new AppError(410, 'gone', message);
export const payloadTooLarge = (message: string) => new AppError(413, 'payload_too_large', message);

export function rateLimited(retryAfterSeconds: number): AppError {
    return new AppError(429, 'rate_limited', `Too many requests. Try again in ${retryAfterSeconds}s.`, {
        'Retry-After': String(retryAfterSeconds),
    });
}

/** A validation failure tied to one form field, so the UI can show it next to that input. */
export class FieldError extends AppError {
    constructor(
        readonly field: string,
        message: string,
        status = 400,
    ) {
        super(status, status === 409 ? 'conflict' : 'bad_request', message);
        this.name = 'FieldError';
    }
}

export const fieldError = (field: string, message: string) => new FieldError(field, message);
