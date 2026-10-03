export type CodeLanguage = 'gdscript' | 'csharp' | 'javascript' | 'bash' | 'json';

const KEYWORDS: Record<CodeLanguage, ReadonlySet<string>> = {
    gdscript: new Set([
        'extends',
        'const',
        'var',
        'func',
        'return',
        'if',
        'elif',
        'else',
        'for',
        'in',
        'and',
        'or',
        'not',
        'true',
        'false',
        'null',
        'await',
        'pass',
    ]),
    csharp: new Set([
        'using',
        'public',
        'private',
        'class',
        'const',
        'string',
        'int',
        'var',
        'void',
        'return',
        'if',
        'else',
        'new',
        'yield',
        'null',
        'true',
        'false',
    ]),
    javascript: new Set([
        'const',
        'let',
        'function',
        'async',
        'await',
        'return',
        'if',
        'new',
        'throw',
        'export',
        'true',
        'false',
        'null',
    ]),
    bash: new Set(['curl']),
    json: new Set(['true', 'false', 'null']),
};

const COMMENT: Record<CodeLanguage, string | null> = {
    gdscript: '#.*',
    csharp: '//.*',
    javascript: '//.*',
    bash: '#.*',
    json: null,
};

const DOUBLE_QUOTED = String.raw`"(?:[^"\\]|\\.)*"`;
const SINGLE_QUOTED = String.raw`'(?:[^'\\]|\\.)*'`;
const BACKTICK_QUOTED = '`(?:[^`\\\\]|\\\\.)*`';

const TOKEN_CLASS = {
    comment: 'text-syntax-comment',
    string: 'text-syntax-string',
    number: 'text-syntax-number',
    keyword: 'text-syntax-keyword',
    function: 'text-syntax-function',
    type: 'text-syntax-type',
    property: 'text-syntax-key',
    decorator: 'text-syntax-keyword',
    flag: 'text-syntax-key',
} as const;

type TokenKind = keyof typeof TOKEN_CLASS;

function buildPattern(language: CodeLanguage): RegExp {
    const comment = COMMENT[language];
    const strings = [
        DOUBLE_QUOTED,
        SINGLE_QUOTED,
        ...(language === 'javascript' ? [BACKTICK_QUOTED] : []),
    ].join('|');

    const parts = [
        comment ? `(?<comment>${comment})` : null,
        `(?<string>${strings})`,
        String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
        String.raw`(?<decorator>@[A-Za-z_]\w*)`,
        String.raw`(?<flag>(?<=\s)--?[A-Za-z][\w-]*)`,
        String.raw`(?<word>[A-Za-z_$][\w$]*)`,
    ];

    return new RegExp(parts.filter(Boolean).join('|'), 'gm');
}

function classifyWord(word: string, language: CodeLanguage, nextChar: string | undefined): TokenKind | null {
    if (KEYWORDS[language].has(word)) return 'keyword';
    if (nextChar === '(') return 'function';
    if ((language === 'csharp' || language === 'gdscript') && /^[A-Z]/.test(word)) return 'type';
    return null;
}

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

/**
 * Minimal, dependency-free syntax colouring for code samples. Runs on the server and returns an
 * HTML string (every piece of text escaped), rendered with `dangerouslySetInnerHTML`: React then
 * sends and hydrates one string instead of hundreds of coloured `<span>` elements.
 */
export function highlightHtml(code: string, language: CodeLanguage): string {
    const pattern = buildPattern(language);
    let html = '';
    let cursor = 0;

    const push = (text: string, kind: TokenKind | null) => {
        if (!text) return;
        html += kind ? `<span class="${TOKEN_CLASS[kind]}">${escapeHtml(text)}</span>` : escapeHtml(text);
    };

    for (const match of code.matchAll(pattern)) {
        const index = match.index;
        const text = match[0];
        const groups = match.groups ?? {};

        push(code.slice(cursor, index), null);
        cursor = index + text.length;

        if (groups.comment) push(text, 'comment');
        else if (groups.string) {
            const isKey = language === 'json' && /^\s*:/.test(code.slice(cursor));
            push(text, isKey ? 'property' : 'string');
        } else if (groups.number) push(text, 'number');
        else if (groups.decorator) push(text, 'decorator');
        else if (groups.flag) push(text, 'flag');
        else push(text, classifyWord(text, language, code[cursor]));
    }

    push(code.slice(cursor), null);
    return html;
}
