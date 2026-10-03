export type ClassValue = string | number | boolean | null | undefined;

/**
 * Joins class names, skipping falsy values. Deliberately does *not* resolve Tailwind conflicts
 * (that needs a ~9 KB runtime on every page): components instead leave out a default when the
 * caller supplies its own, using `hasUtility`.
 */
export function cn(...values: ClassValue[]): string {
    let result = '';
    for (const value of values) {
        if (typeof value === 'string' && value.length > 0) result = result ? `${result} ${value}` : value;
    }
    return result;
}

/** Whether `className` contains a utility matching `pattern` (anchored to whole class names). */
export function hasUtility(className: string | undefined, pattern: RegExp): boolean {
    if (!className) return false;
    return className.split(/\s+/).some((name) => pattern.test(name.slice(name.lastIndexOf(':') + 1)));
}
