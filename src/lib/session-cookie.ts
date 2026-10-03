/**
 * Session cookie name, shared by the server (which reads and writes it) and `proxy.ts` (which only
 * checks for its presence). `__Host-` pins it to this exact origin over HTTPS; plain-http localhost
 * can't use the prefix.
 */
export const SESSION_COOKIE =
    process.env.NODE_ENV === 'production' ? '__Host-lasma-session' : 'lasma-session';
