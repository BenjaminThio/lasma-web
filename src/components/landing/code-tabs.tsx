import { CopyButton } from '@/components/ui/copy-button';
import { LightBulb } from '@/components/ui/status';

export interface RenderedSample {
    id: string;
    filename: string;
    code: string;
    /** Highlighted, escaped HTML from `highlightHtml`. */
    html: string;
}

interface CodeTabsProps {
    samples: RenderedSample[];
    /** Radio group name; must be unique if a page shows more than one tab set. */
    name?: string;
}

/**
 * Tabbed code viewer with no JavaScript: the tabs are radio buttons (arrow keys switch them) and
 * `.code-tabs` rules in globals.css show the matching panel and copy button. Highlighting is done
 * on the server, and each sample is sent to the browser once.
 */
export function CodeTabs({ samples, name = 'code-sample' }: CodeTabsProps) {
    return (
        <div className="code-tabs overflow-hidden rounded-xl bg-editor/90 shadow-glow">
            <div className="flex items-center border-b-2 border-editor-edge bg-editor-edge">
                <div
                    role="radiogroup"
                    aria-label="Code examples"
                    className="code-tabs-list scrollbar-none flex grow overflow-x-auto"
                >
                    {samples.map((sample, index) => (
                        <label
                            key={sample.id}
                            className="flex shrink-0 cursor-pointer items-center gap-2 border-r border-black/40 px-3 py-2.5 text-xs text-muted transition-colors hover:text-white has-checked:bg-editor has-checked:text-white has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-accent sm:text-sm"
                        >
                            <input
                                type="radio"
                                name={name}
                                value={sample.id}
                                defaultChecked={index === 0}
                                className="peer sr-only"
                            />
                            <span className="flex peer-checked:hidden">
                                <LightBulb color={null} scale={0.8} />
                            </span>
                            <span className="hidden peer-checked:flex">
                                <LightBulb color="#00ff7f" scale={0.8} />
                            </span>
                            {sample.filename}
                        </label>
                    ))}
                </div>
                <div className="code-tabs-copy mx-2">
                    {samples.map((sample) => (
                        <CopyButton key={sample.id} value={sample.code} label={`Copy ${sample.filename}`} />
                    ))}
                </div>
            </div>
            <div className="code-tabs-panels">
                {samples.map((sample) => (
                    <pre
                        key={sample.id}
                        tabIndex={0}
                        aria-label={sample.filename}
                        className="max-h-[30rem] overflow-auto p-4 text-[13px] leading-relaxed sm:p-5 sm:text-sm"
                    >
                        <code dangerouslySetInnerHTML={{ __html: sample.html }} />
                    </pre>
                ))}
            </div>
        </div>
    );
}
