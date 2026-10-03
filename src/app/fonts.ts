import localFont from 'next/font/local';

/*
 * The pixel fonts ship in two files each: a tiny Latin subset (~13 KB, preloaded) and an extended
 * subset with CJK/Hangul/Cyrillic glyphs that browsers only download when such characters appear.
 * The originals were 4 MB and 2.6 MB and loaded on every page.
 */

export const pixelLatin = localFont({
    src: './fonts/fusion-pixel-12px-latin.woff2',
    variable: '--font-pixel-latin',
    display: 'swap',
    adjustFontFallback: false,
    declarations: [
        {
            prop: 'unicode-range',
            value: 'U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2190-21FF, U+2212, U+2215, U+2500-25FF, U+2600-27BF',
        },
    ],
});

export const pixelExtended = localFont({
    src: './fonts/fusion-pixel-12px-ext.woff2',
    variable: '--font-pixel-ext',
    display: 'swap',
    preload: false,
    adjustFontFallback: false,
    declarations: [
        {
            prop: 'unicode-range',
            value: 'U+0100-012D, U+0143-014F, U+0154-0233, U+0384-045D, U+04E2-04EF, U+2070-209C, U+2150-2189, U+2200-2211, U+2213-2214, U+2216-231F, U+23CE-24FF, U+3000-318E, U+3220-3403, U+4E00-9FF8, U+AC00-D7A3, U+E000-E0DB, U+F000-F03D, U+F8FF, U+FE10-FE4F, U+FF01-FFFD',
        },
    ],
});

export const pixelSmallLatin = localFont({
    src: './fonts/fusion-pixel-10px-latin.woff2',
    variable: '--font-pixel-sm-latin',
    display: 'swap',
    preload: false,
    adjustFontFallback: false,
    declarations: [
        {
            prop: 'unicode-range',
            value: 'U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2190-21FF, U+2212, U+2215, U+2500-25FF, U+2600-27BF',
        },
    ],
});

export const pixelSmallExtended = localFont({
    src: './fonts/fusion-pixel-10px-ext.woff2',
    variable: '--font-pixel-sm-ext',
    display: 'swap',
    preload: false,
    adjustFontFallback: false,
    declarations: [
        {
            prop: 'unicode-range',
            value: 'U+0100-012D, U+0143-014F, U+0154-0233, U+2070-209C, U+2150-2189, U+230C-231F, U+23CE-24FF, U+3000-318E, U+3220-33FE, U+4E00-9FED, U+AC00-D7A3, U+E000-E0DB, U+F000-F03D, U+F8FF, U+FE10-FE4F, U+FF01-FFFD',
        },
    ],
});

export const mars = localFont({
    src: './fonts/mars.woff2',
    variable: '--font-mars-face',
    display: 'swap',
    preload: false,
    adjustFontFallback: false,
});

export const marsMono = localFont({
    src: './fonts/mars-mono.woff2',
    variable: '--font-mars-mono-face',
    display: 'swap',
    preload: false,
    adjustFontFallback: false,
});

export const fontVariables = [pixelLatin, pixelExtended, pixelSmallLatin, pixelSmallExtended, mars, marsMono]
    .map((font) => font.variable)
    .join(' ');
