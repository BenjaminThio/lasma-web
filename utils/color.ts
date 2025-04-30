import { Camel2Kebab } from './string-formatters';

export type HEX = `#${string}`;
export type HEXA = `#${string}`;
export type RGB = [r: number, g: number, b: number]
export type HSL = [h: number, s: number, l: number]
export type RGBA = [r: number, g: number, b: number, a: number]
export type HSLA = [h: number, s: number, l: number, a: number]
export enum ColorChannel {
    Red,
    Green,
    Blue
}
export enum ColorFormat {
    Rgb,
    Hex,
    Hsl
}

export const colorKeywords: Readonly<Record<string, Record<string, RGB>>> = {
    basicColors: {
        black: [0, 0, 0], // #000000
        silver: [192, 192, 192], // #C0C0C0
        gray: [128, 128, 128], // #808080
        white: [255, 255, 255], // #FFFFFF
        maroon: [128, 0, 0], // #800000
        red: [255, 0, 0], // #FF0000
        purple: [128, 0, 128], // #800080
        fuchsia: [255, 0, 255], // #FF00FF
        green: [0, 128, 0], // #008000
        lime: [0, 255, 0], // #00FF00
        olive: [128, 128, 0], // #808000
        yellow: [255, 255, 0], // #FFFF00
        navy: [0, 0, 128], // #000080
        blue: [0, 0, 255], // #0000FF
        teal: [0, 128, 128], // #008080
        aqua: [0, 255, 255], // #00FFFF
    },
    extendedColors: {
        aliceblue: [240, 248, 255], // #f0f8ff
        antiquewhite: [250, 235, 215], // #faebd7
        aqua: [0, 255, 255], // #00ffff
        aquamarine: [127, 255, 212], // #7fffd4
        azure: [240, 255, 255], // #f0ffff
        beige: [245, 245, 220], // #f5f5dc
        bisque: [255, 228, 196], // #ffe4c4
        black: [0, 0, 0], // #000000
        blanchedalmond: [255, 235, 205], // #ffebcd
        blue: [0, 0, 255], // #0000ff
        blueviolet: [138, 43, 226], // #8a2be2
        brown: [165, 42, 42], // #a52a2a
        burlywood: [222, 184, 135], // #deb887
        cadetblue: [95, 158, 160], // #5f9ea0
        chartreuse: [127, 255, 0], // #7fff00
        chocolate: [210,105,30], // #d2691e
        coral: [255, 127, 80], // #ff7f50
        cornflowerblue: [100, 149, 237], // #6495ed
        cornsilk: [255, 248, 220], // #fff8dc
        crimson: [220, 20, 60], // #dc143c
        cyan: [0, 255, 255], // #00ffff
        darkblue: [0, 0, 139], // #00008b
        darkcyan: [0, 139, 139], // #008b8b
        darkgoldenrod: [184, 134, 11], // #b8860b
        darkgray: [169, 169, 169], // #a9a9a9
        darkgreen: [0, 100, 0], // #006400
        darkgrey: [169, 169, 169], // #a9a9a9
        darkkhaki: [189, 183, 107], // #bdb76b
        darkmagenta: [139, 0, 139], // #8b008b
        darkolivegreen: [85, 107, 47], // #556b2f
        darkorange: [255, 140, 0], // #ff8c00
        darkorchid: [153, 50, 204], // #9932cc
        darkred: [139, 0, 0], // #8b0000
        darksalmon: [233, 150, 122], // #e9967a
        darkseagreen: [143, 188, 143], // #8fbc8f
        darkslateblue: [72, 61, 139], // #483d8b
        darkslategray: [47, 79, 79], // #2f4f4f
        darkslategrey: [47, 79, 79], // #2f4f4f
        darkturquoise: [0, 206, 209], // #00ced1
        darkviolet: [148, 0, 211], // #9400d3
        deeppink: [255, 20, 147], // #ff1493
        deepskyblue: [0, 191, 255], // #00bfff
        dimgray: [105, 105, 105], // #696969
        dimgrey: [105, 105, 105], // #696969
        dodgerblue: [30, 144, 255], // #1e90ff
        firebrick: [178, 34, 34], // #b22222
        floralwhite: [255, 250, 240], // #fffaf0
        forestgreen: [34, 139, 34], // #228b22
        fuchsia: [255, 0, 255], // #ff00ff
        gainsboro: [220, 220, 220], // #dcdcdc
        ghostwhite: [248, 248, 255], // #f8f8ff
        gold: [255, 215, 0], // #ffd700
        goldenrod: [218, 165, 32], // #daa520
        gray: [128, 128, 128], // #808080
        green: [0, 128, 0], // #008000
        greenyellow: [173, 255, 47], // #adff2f
        grey: [128, 128, 128], // #808080
        honeydew: [240, 255, 240], // #f0fff0
        hotpink: [255, 105, 180], // #ff69b4
        indianred: [205, 92, 92], // #cd5c5c
        indigo: [75, 0, 130], // #4b0082
        ivory: [255, 255, 240], // #fffff0
        khaki: [240, 230, 140], // #f0e68c
        lavender: [230, 230, 250], // #e6e6fa
        lavenderblush: [255, 240, 245], // #fff0f5
        lawngreen: [124, 252, 0], // #7cfc00
        lemonchiffon: [255, 250, 205], // #fffacd
        lightblue: [173, 216, 230], // #add8e6
        lightcoral: [240, 128, 128], // #f08080
        lightcyan: [224, 255, 255], // #e0ffff
        lightgoldenrodyellow: [250, 250, 210], // #fafad2
        lightgray: [211, 211, 211], // #d3d3d3
        lightgreen: [144, 238, 144], // #d3d3d3
        lightgrey: [211, 211, 211], // #d3d3d3
        lightpink: [255, 182, 193], // #ffb6c1
        lightsalmon: [255, 160, 122], // #ffa07a
        lightseagreen: [32, 178, 170], // #20b2aa
        lightskyblue: [135, 206, 250], // #87cefa
        lightslategray: [119, 136, 153], // #778899
        lightslategrey: [119, 136, 153], // #778899
        lightsteelblue: [176, 196, 222], // #b0c4de
        lightyellow: [255, 255, 224], // #ffffe0
        lime: [0, 255, 0], // #00ff00
        limegreen: [50, 205, 50], // #32cd32
        linen: [250, 240, 230], // #faf0e6
        magenta: [255, 0, 255], // #ff00ff
        maroon: [128, 0, 0], // #800000
        mediumaquamarine: [102, 205, 170], // #66cdaa
        mediumblue: [0, 0, 205], // #0000cd
        mediumorchid: [186, 85, 211], // #ba55d3
        mediumpurple: [147, 112, 219], // #9370db
        mediumseagreen: [60, 179, 113], // #3cb371
        mediumslateblue: [123, 104, 238], // #7b68ee
        mediumspringgreen: [0, 250, 154], // #00fa9a
        mediumturquoise: [72, 209, 204], // #48d1cc
        mediumvioletred: [199, 21, 133], // #c71585
        midnightblue: [25, 25, 112], // #191970
        mintcream: [245, 255, 250], // #f5fffa
        mistyrose: [255, 228, 225], // #ffe4e1
        moccasin: [255, 228, 181], // #ffe4b5
        navajowhite: [255, 222, 173], // #ffdead
        navy: [0, 0, 128], // #000080
        oldlace: [253, 245, 230], // #fdf5e6
        olive: [128, 128, 0], // #808000
        olivedrab: [107, 142, 35], // #6b8e23
        orange: [255, 165, 0], // #ffa500
        orangered: [255, 69, 0], // #ff4500
        orchid: [218, 112, 214], // #da70d6
        palegoldenrod: [238, 232, 170], // #eee8aa
        palegreen: [152, 251, 152], // #98fb98
        paleturquoise: [175, 238, 238], // #afeeee
        palevioletred: [219, 112, 147], // #db7093
        papayawhip: [255, 239, 213], // #ffefd5
        peachpuff: [255, 218, 185], // #ffdab9
        peru: [205, 133, 63], // #cd853f
        pink: [255, 192, 203], // #ffc0cb
        plum: [221, 160, 221], // #dda0dd
        powderblue: [176, 224, 230], // #b0e0e6
        purple: [128, 0, 128], // #800080
        red: [255, 0, 0], // #ff0000
        rosybrown: [188, 143, 143], // #bc8f8f
        royalblue: [65, 105, 225], // #4169e1
        saddlebrown: [139, 69, 19], // #8b4513
        salmon: [250, 128, 114], // #fa8072
        sandybrown: [244, 164, 96], // #f4a460
        seagreen: [46, 139, 87], // #2e8b57
        seashell: [255, 245, 238], // #fff5ee
        sienna: [160, 82, 45], // #a0522d
        silver: [192, 192, 192], // #c0c0c0
        skyblue: [135, 206, 235], // #87ceeb
        slateblue: [106, 90, 205], // #6a5acd
        slategray: [112, 128, 144], // #708090
        slategrey: [112, 128, 144], // #708090
        snow: [255,250,250], // #fffafa
        springgreen: [0, 255, 127], // #00ff7f
        steelblue: [70, 130, 180], // #4682b4
        tan: [210, 180, 140], // #d2b48c
        teal: [0, 128, 128], // #008080
        thistle: [216, 191, 216], // #d8bfd8
        tomato: [255, 99, 71], // #ff6347
        turquoise: [64, 224, 208], // #40e0d0
        violet: [238, 130, 238], // #ee82ee
        wheat: [245, 222, 179], // #f5deb3
        white: [255, 255, 255], // #ffffff
        whitesmoke: [245, 245, 245], // #f5f5f5
        yellow: [255, 255, 0], // #ffff00
        yellowgreen: [154, 205, 50] // #9acd32
    }
};

export function ParseRgb(colorFormat: string, ignoreAlphaChannel: boolean = false): RGB | RGBA {
    colorFormat = colorFormat.toLowerCase();

    // Keyword
    if (colorKeywords.extendedColors.hasOwnProperty(colorFormat)) {
        return ignoreAlphaChannel ? colorKeywords.extendedColors[colorFormat] : [...colorKeywords.extendedColors[colorFormat], 1];
    }
    // Hex (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
    else if (colorFormat.startsWith('#') && [4, 5, 7, 9].includes(colorFormat.length)) {
        if ([4, 7].includes(colorFormat.length) || ignoreAlphaChannel) return Hex2Rgb(colorFormat as HEX);
        else return Hexa2Rgba(colorFormat as HEX);
    }
    // rgb
    else if (colorFormat.startsWith('rgb')) {
        const channels: RegExpMatchArray = colorFormat.match(/\d+/g) as RegExpMatchArray;
        
        if (channels != null && channels.length >= 3 && channels.length <= 4) {
            return channels.map(Number) as RGB | RGBA;
        }
        else {
            return Array(ignoreAlphaChannel ? 3 : 4).fill(0) as RGB | RGBA;
        }
    }
    else {
        return Array(ignoreAlphaChannel ? 3 : 4).fill(0) as RGB | RGBA;
    }
}

function Component2Hex(component: number): string {
    return component.toString(16).padStart(2, '0');
}

export function Rgb2Hex(rgb: RGB): HEX {
    return `#${rgb.map(channelValue => Component2Hex(channelValue)).join('')}`;
}

export function Rgba2Hexa([r, g, b, a]: RGBA): HEXA {
    return `${Rgb2Hex([r, g, b])}${Component2Hex((a * 255))}`;
}

export function Rgb2Hsl(rgb: RGB): HSL {
    rgb = rgb.map(channelValue => channelValue / 255) as RGB;

    const
        [r, g, b] = rgb,
        min: number = Math.min(...rgb),
        max: number = Math.max(...rgb),
        delta: number = max - min;
    
    let hue: number = 0,
        lightness: number = 0,
        saturation: number = 0;

    if (delta === 0) {
        hue = 0;
    }
    else
    {
        switch (max) {
            case r:
                hue = (g - b) / delta % 6;
                break;
            case g:
                hue = (b - r) / delta + 2;
                break;
            case b:
                hue = (r - g) / delta + 4;
        }
    }

    hue = Math.round(hue * 60);

    if (hue < 0) hue += 360;

    lightness = (min + max) / 2;
    saturation = Math.round(delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1)) * 100);
    lightness = Math.round(lightness * 100);

    return [hue, saturation, lightness];
}

export function Rgba2Hsla([r, g, b, a]: RGBA): HSLA {
    return [...Rgb2Hsl([r, g, b]), a];
}

export function Hex2Rgb(hex: HEX): RGB {
    hex = hex.slice(1) as HEX;

    if (hex.length === 3) {
        hex.split('').map(char => char + char).join('');
    }

    const r: number = parseInt(hex.slice(0, 2), 16);
    const g: number = parseInt(hex.slice(2, 4), 16);
    const b: number = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
}

export function Hexa2Rgba(hexa: string): RGBA {
    hexa = hexa.slice(1);

    if (hexa.length === 4) {
        hexa.split('').map(char => char + char).join('');
    }

    const r: number = parseInt(hexa.slice(0, 2), 16);
    const g: number = parseInt(hexa.slice(2, 4), 16);
    const b: number = parseInt(hexa.slice(4, 6), 16);
    const a: number = parseInt(hexa.slice(6, 8), 16);

    return [r, g, b, a];
}

export function Hex2Hsl(hex: HEX): HSL {
    return Rgb2Hsl(Hex2Rgb(hex));
}

export function Hexa2Hsla(hexa: HEXA): HSLA {
    return Rgba2Hsla(Hexa2Rgba(hexa));
}

enum Conversion {
    Normal,
    Alternative
}

export function HslToRgb([h, s, l]: HSL, conversion: Conversion = Conversion.Alternative): RGB {
    s /= 100;
    l /= 100;

    switch (conversion) {
        case Conversion.Normal:
            const chroma: number = (1 - Math.abs(2 * l - 1)) * s;
            const _h: number = h / 60;
            const x = chroma * (1 - Math.abs(_h % 2 - 1));
            const m: number = l - chroma / 2;
            let rgb: number[] = [];

            if (0 <= _h && _h < 1) rgb = [chroma, x, 0];
            else if (1 <= _h && _h < 2) rgb = [x, chroma, 0];
            else if (2 <= _h && _h < 3) rgb = [0, chroma, x];
            else if (3 <= _h && _h < 4) rgb = [0, x, chroma];
            else if (4 <= _h && _h < 5) rgb = [x, 0, chroma];
            else if (5 <= _h && _h < 6) rgb = [chroma, 0, x];
            else rgb = [0, 0, 0];

            return rgb.map(channelValue => Math.round((channelValue + m) * 255)) as RGB;
        case Conversion.Alternative:
            const a = s * Math.min(l, 1 - l);
            const k = (n: number): number => (n + h / 30) % 12;
            const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
        
            return [f(0), f(8), f(4)].map(channelValue => Math.round(channelValue * 255)) as RGB;
    }
}

export function test() {
    
}

export function HSLToHex(hsl: HSL): HEX {
    return Rgb2Hex(HslToRgb(hsl));
}

export function brightenColor(rgb: RGB, amount: number): RGB {
    return rgb.map(channelValue => {channelValue += amount; if (channelValue > 255) return 255; else if (channelValue < 0) return 0; return channelValue;}) as RGB;
}

export function Stringify([channel1, channel2, channel3, channel4]: RGB | RGBA | HSL | HSLA, colorFormat: ColorFormat): string {
    switch (colorFormat) {
        case ColorFormat.Rgb:
            return `${ColorFormat[colorFormat].toLowerCase()}(${channel1}, ${channel2}, ${channel3}${channel4 === undefined ? '' : `, ${channel4}`})`;
        case ColorFormat.Hsl:
            return `${ColorFormat[colorFormat].toLowerCase()}(${channel1}, ${channel2}%, ${channel3}%${channel4 === undefined ? '' : `, ${channel4}`})`;
    }
    return '';
}

export function GetStringifiedCssProperties(rgb: RGB, scale: number, bloomIntensity: number, colorFormat: ColorFormat, size: number = 0.5): string {
    size *= scale;

    let baseColorValue: string = '',
        haloColorValue: string = '',
        bloomColorValue: string = '';

    switch (colorFormat) {
        case ColorFormat.Rgb:
            baseColorValue = Stringify(rgb, ColorFormat.Rgb);
            haloColorValue = Stringify(brightenColor(rgb, 200), ColorFormat.Rgb);
            bloomColorValue = Stringify([...rgb, bloomIntensity], ColorFormat.Rgb);
            break;
        case ColorFormat.Hex:
            baseColorValue = Rgb2Hex(rgb);
            haloColorValue = Rgb2Hex(brightenColor(rgb, 200));
            bloomColorValue = Rgba2Hexa([...rgb, bloomIntensity]);
            break;
        case ColorFormat.Hsl:
            baseColorValue = Stringify(Rgb2Hsl(rgb), ColorFormat.Hsl);
            haloColorValue = Stringify(Rgb2Hsl(brightenColor(rgb, 200)), ColorFormat.Hsl);
            bloomColorValue = Stringify(Rgba2Hsla([...rgb, bloomIntensity]), ColorFormat.Hsl);
    }

    const cssProperties: Record<string, string> = {
        background: baseColorValue,
        height: `${size}rem`,
        aspectRatio: '1',
        borderRadius: '50%',
        boxShadow: `inset 0 0 ${size * 0.24}rem ${size * 0.24}rem ${haloColorValue}, 0 0 ${size}rem ${size / 2}rem ${bloomColorValue}`
    };

    return `.light-bulb {\n${Object.entries(cssProperties).map(([key, value]) => `\t${Camel2Kebab(key)}: ${value}`).join(';\n')};\n}`;
}