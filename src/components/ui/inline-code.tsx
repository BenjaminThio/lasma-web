import { splitInlineCode } from '@/config/api-docs';

/** Renders a short description, turning `backticked` words into inline code. */
export function InlineCode({ text }: { text: string }) {
    return splitInlineCode(text).map((part, index) =>
        part.code ? (
            <code key={index} className="rounded bg-white/5 px-1 text-white">
                {part.text}
            </code>
        ) : (
            part.text
        ),
    );
}
