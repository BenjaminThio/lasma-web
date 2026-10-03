const numberFormatter = new Intl.NumberFormat('en-US');

// Dates are rendered in UTC so server-rendered and client-appended rows always agree.
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

export function formatPlayerDate(datetime: string): { date: string; time: string; iso: string | undefined } {
    const date = new Date(datetime);

    if (Number.isNaN(date.getTime())) {
        return { date: datetime, time: '', iso: undefined };
    }

    return {
        date: dateFormatter.format(date),
        time: `${timeFormatter.format(date)} UTC`,
        iso: date.toISOString(),
    };
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
    return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function camelToTitle(text: string): string {
    return text.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

export function camelToKebab(text: string): string {
    return text.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** A timestamp as "17 Sep 2026" (UTC, so server and client agree). */
export function formatDate(timestamp: number): string {
    return dateFormatter.format(new Date(timestamp));
}
