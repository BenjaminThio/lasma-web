import 'server-only';

type Level = 'info' | 'warn' | 'error';

function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack };
    }
    return { value: String(error) };
}

function write(level: Level, message: string, meta?: Record<string, unknown>): void {
    const entry: Record<string, unknown> = { level, message, time: new Date().toISOString() };

    if (meta) {
        for (const [key, value] of Object.entries(meta)) {
            entry[key] = value instanceof Error ? serializeError(value) : value;
        }
    }

    const line = JSON.stringify(entry);

    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.info(line);
}

/** Structured JSON logs — easy to grep locally and to ingest in production. */
export const logger = {
    info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};
