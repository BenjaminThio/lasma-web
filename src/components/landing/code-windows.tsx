import Image from 'next/image';
import { LightBulb } from '@/components/ui/status';
import { crossIcon, jsonIcon } from '@/config/assets';
import { cn } from '@/lib/cn';
import { highlightHtml } from '@/lib/highlight';

interface EditorCardProps {
    filename: string;
    code: string;
    className?: string;
}

/** The VS Code–style JSON window from the original landing page, now with syntax colours. */
export function EditorCard({ filename, code, className }: EditorCardProps) {
    // One string for the whole file; line numbers come from a CSS counter (see `.code-lines`).
    const html = code
        .split('\n')
        .map((line) => `<span>${highlightHtml(line, 'json')}</span>`)
        .join('');

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg pb-6 text-[13px] shadow-glow sm:text-sm lg:text-base',
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-[0.5rem_0.3rem_0_0] border-b-2 border-editor-edge bg-editor/90 px-3 py-2.5">
                    <Image src={jsonIcon} alt="" className="size-[17px]" />
                    <span>{filename}</span>
                    <LightBulb color="#00ff7f" />
                    <Image src={crossIcon} alt="" className="ml-1 size-2.5" />
                </div>
                <Image src={crossIcon} alt="" className="mr-4 size-2.5" />
            </div>
            <div className="relative bg-editor/90">
                <div className="scrollbar-none max-h-[26rem] overflow-auto p-3 sm:max-h-[32rem]">
                    <code
                        className="code-lines flex min-w-fit flex-col gap-1 font-pixel sm:gap-1.5"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-editor to-transparent"
                />
            </div>
        </div>
    );
}

interface TerminalCardProps {
    title: string;
    command: string;
    response: string[];
    className?: string;
}

export function TerminalCard({ title, command, response, className }: TerminalCardProps) {
    const [status, ...headers] = response;

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg bg-[#0c0c0d] text-[13px] shadow-float ring-1 ring-white/10 sm:text-sm',
                className,
            )}
        >
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5">
                <span aria-hidden className="flex gap-2">
                    <LightBulb color="#ff0000" />
                    <LightBulb color="#ffa500" />
                    <LightBulb color="#00ff7f" />
                </span>
                <span className="font-pixel-sm text-muted">{title}</span>
            </div>
            <pre className="p-4 leading-relaxed break-all whitespace-pre-wrap">
                <code dangerouslySetInnerHTML={{ __html: highlightHtml(command, 'bash') }} />
                {status ? <span className="mt-4 block text-ready">{status}</span> : null}
                {headers.map((header) => (
                    <span key={header} className="block text-muted">
                        {header}
                    </span>
                ))}
            </pre>
        </div>
    );
}
