export function deepMerge<T>(target: T, source: T): T {
    const result: T = { ...target };

    for (const key in source) {
        if (isRecord(source[key])) {
            result[key] = deepMerge((target as any)[key] || {}, (source as any)[key]);
        } else {
            result[key] = source[key]!;
        }
    }

    return result;
}

export function isRecord(value: unknown): boolean {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return true;
    } else {
        return false;
    }
}