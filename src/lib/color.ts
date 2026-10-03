export type RGB = readonly [r: number, g: number, b: number];
export type HSL = readonly [h: number, s: number, l: number];

export const ColorFormat = {
    Rgb: 0,
    Hex: 1,
    Hsl: 2,
} as const;
export type ColorFormat = (typeof ColorFormat)[keyof typeof ColorFormat];

export const COLOR_FORMAT_LABEL: Record<ColorFormat, string> = {
    [ColorFormat.Rgb]: 'Rgb',
    [ColorFormat.Hex]: 'Hex',
    [ColorFormat.Hsl]: 'Hsl',
};

export const OFF_BULB: RGB = [0, 0, 0];

function clampChannel(value: number): number {
    return Math.min(255, Math.max(0, Math.round(value)));
}

function toHexByte(value: number): string {
    return clampChannel(value).toString(16).padStart(2, '0');
}

/** Parses `#rgb` or `#rrggbb` (the `#` is optional). Returns `null` for anything else. */
export function hexToRgb(hex: string): RGB | null {
    const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());

    if (!match?.[1]) return null;

    const digits = match[1].length === 3 ? [...match[1]].map((char) => char + char).join('') : match[1];
    const value = Number.parseInt(digits, 16);

    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function rgbToHex(rgb: RGB): string {
    return `#${rgb.map(toHexByte).join('')}`;
}

/** `alpha` is 0–1. */
export function rgbaToHex(rgb: RGB, alpha: number): string {
    return `${rgbToHex(rgb)}${toHexByte(alpha * 255)}`;
}

export function rgbToHsl([red, green, blue]: RGB): HSL {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const lightness = (max + min) / 2;

    let hue = 0;

    if (delta !== 0) {
        if (max === r) hue = ((g - b) / delta) % 6;
        else if (max === g) hue = (b - r) / delta + 2;
        else hue = (r - g) / delta + 4;
    }

    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;

    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    return [hue, Math.round(saturation * 100), Math.round(lightness * 100)];
}

export function brighten(rgb: RGB, amount: number): RGB {
    return [clampChannel(rgb[0] + amount), clampChannel(rgb[1] + amount), clampChannel(rgb[2] + amount)];
}

export function formatRgb([r, g, b]: RGB, alpha?: number): string {
    return alpha === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatHsl([h, s, l]: HSL, alpha?: number): string {
    return alpha === undefined ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
}

function formatColor(rgb: RGB, format: ColorFormat, alpha?: number): string {
    switch (format) {
        case ColorFormat.Rgb:
            return formatRgb(rgb, alpha);
        case ColorFormat.Hsl:
            return formatHsl(rgbToHsl(rgb), alpha);
        case ColorFormat.Hex:
            return alpha === undefined ? rgbToHex(rgb) : rgbaToHex(rgb, alpha);
    }
}

export interface BulbStyle {
    backgroundColor: string;
    height: string;
    boxShadow: string;
}

/**
 * The glowing light-bulb look: a base colour, a bright inner halo and an outer bloom.
 * Pass `null` for an unlit bulb (no bloom).
 */
export function bulbStyle(
    rgb: RGB | null,
    scale = 1,
    bloomIntensity = 1,
    format: ColorFormat = ColorFormat.Hex,
): BulbStyle {
    const size = 0.5 * scale;
    const base = rgb ?? OFF_BULB;
    const halo = `inset 0 0 ${size * 0.24}rem ${size * 0.24}rem ${formatColor(brighten(base, 200), format)}`;
    const bloom = rgb ? `, 0 0 ${size}rem ${size / 2}rem ${formatColor(base, format, bloomIntensity)}` : '';

    return {
        backgroundColor: formatColor(base, format),
        height: `${size}rem`,
        boxShadow: `${halo}${bloom}`,
    };
}

/** The same bulb as a copy-pasteable CSS rule. */
export function bulbCss(rgb: RGB, scale: number, bloomIntensity: number, format: ColorFormat): string {
    const style = bulbStyle(rgb, scale, bloomIntensity, format);

    return [
        '.light-bulb {',
        `\tbackground: ${style.backgroundColor};`,
        `\theight: ${style.height};`,
        '\taspect-ratio: 1;',
        '\tborder-radius: 50%;',
        `\tbox-shadow: ${style.boxShadow};`,
        '}',
    ].join('\n');
}
