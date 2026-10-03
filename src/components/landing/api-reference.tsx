import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { faArrowRight } from '@/components/ui/icons';
import { InlineCode } from '@/components/ui/inline-code';
import { Container, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { ENDPOINTS, METHOD_STYLES, PARAMETER_SUMMARY } from '@/config/api-docs';
import { cn } from '@/lib/cn';
import { highlightHtml } from '@/lib/highlight';
import { buildCodeSamples } from './code-samples';
import { CodeTabs } from './code-tabs';

export function ApiReference({ origin }: { origin: string }) {
    const samples = buildCodeSamples(origin).map((sample) => ({
        id: sample.id,
        filename: sample.filename,
        code: sample.code,
        html: highlightHtml(sample.code, sample.language),
    }));

    return (
        <section id="api" className="scroll-mt-20 border-t border-white/5">
            <Container className="grid gap-12 py-24 sm:py-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
                <div className="flex flex-col gap-10">
                    <Reveal>
                        <SectionHeading
                            eyebrow="api"
                            title="One endpoint. Four verbs."
                            description={
                                <>
                                    Everything goes through{' '}
                                    <code className="text-white">/api/leaderboard</code>. Send parameters in
                                    the query string, a JSON body or a form, whichever your engine makes easy.
                                </>
                            }
                        />
                    </Reveal>

                    <ul className="flex flex-col gap-3">
                        {ENDPOINTS.map((endpoint, index) => (
                            <Reveal
                                as="li"
                                key={endpoint.method}
                                delay={index * 60}
                                className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-surface p-4"
                            >
                                <span
                                    className={cn(
                                        'w-16 shrink-0 rounded-md py-1 text-center text-sm font-bold',
                                        METHOD_STYLES[endpoint.method],
                                    )}
                                >
                                    {endpoint.method}
                                </span>
                                <div className="min-w-0">
                                    <code className="block truncate text-sm text-white">
                                        /api/leaderboard<span className="text-muted">{endpoint.query}</span>
                                    </code>
                                    <p className="mt-1 font-pixel-sm text-sm leading-relaxed text-muted">
                                        <InlineCode text={endpoint.summary} />
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </ul>

                    <Reveal>
                        <details className="group rounded-xl border border-white/[0.06] bg-surface">
                            <summary className="flex list-none items-center justify-between gap-4 p-4 text-lg [&::-webkit-details-marker]:hidden">
                                Parameters
                                <span
                                    aria-hidden
                                    className="text-accent transition-transform duration-300 group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>
                            <div className="overflow-x-auto px-4 pb-4">
                                <table className="w-full text-left font-pixel-sm text-sm">
                                    <thead className="text-subtle">
                                        <tr>
                                            <th className="py-2 pr-4 font-normal">Name</th>
                                            <th className="py-2 pr-4 font-normal">Used by</th>
                                            <th className="py-2 font-normal">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted">
                                        {PARAMETER_SUMMARY.map((parameter) => (
                                            <tr
                                                key={parameter.name}
                                                className="border-t border-white/5 align-top"
                                            >
                                                <td className="py-2 pr-4">
                                                    <code className="text-white">{parameter.name}</code>
                                                </td>
                                                <td className="py-2 pr-4 whitespace-nowrap">
                                                    {parameter.usedBy}
                                                </td>
                                                <td className="py-2">
                                                    <InlineCode text={parameter.notes} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </Reveal>

                    <Reveal>
                        <Link
                            href="/docs"
                            className="group inline-flex items-center gap-2 text-lg text-accent transition-colors hover:text-white"
                        >
                            Read the full API docs
                            <Icon
                                icon={faArrowRight}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    </Reveal>
                </div>

                <Reveal className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                    <CodeTabs samples={samples} />
                    <p className="mt-4 font-pixel-sm text-sm leading-relaxed text-subtle">
                        Web builds ship their code to the player&apos;s browser, write key included. Rate
                        limits and key rotation are your safety net there.
                    </p>
                </Reveal>
            </Container>
        </section>
    );
}
