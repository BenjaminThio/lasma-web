export function Camel2Title(text: string) {
    let newText: string = '';

    for (let charIndex: number = 0; charIndex < text.length; charIndex++) {
        const char: string = text.charAt(charIndex);

        if (charIndex === 0) newText += char.toUpperCase();
        else newText += (char === char.toUpperCase() ? ' ' : '') + char;
    }

    return newText;
}

export function Camel2Kebab(text: string) {
    let newText: string = '';

    for (let charIndex: number = 0; charIndex < text.length; charIndex++) {
        const char: string = text.charAt(charIndex);

        newText += (char === char.toUpperCase() ? '-' : '') + char.toLowerCase();
    }

    return newText;
}