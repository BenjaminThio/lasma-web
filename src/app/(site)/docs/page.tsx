import type { Metadata, Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buildCodeSamples } from '@/components/landing/code-samples';
import { CodeTabs } from '@/components/landing/code-tabs';
import { PageTransition } from '@/components/layout/page-transition';
import { CopyButton } from '@/components/ui/copy-button';
import { Icon } from '@/components/ui/icon';
import { faBookOpen, faKey } from '@/components/ui/icons';
import { InlineCode } from '@/components/ui/inline-code';
import { Container } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { ENDPOINTS, ERRORS, METHOD_STYLES, RATE_LIMIT_SUMMARY, type Endpoint } from '@/config/api-docs';
import { cn } from '@/lib/cn';
import { PAGE_SIZE, WRITE_KEY_HEADER } from '@/lib/constants';
import { highlightHtml, type CodeLanguage } from '@/lib/highlight';
import { getRequestOrigin } from '@/server/http/base-url';

export const metadata: Metadata = {
    title: 'API docs',
    description:
        'Everything the LASMA leaderboard API does: endpoints, write keys, paging, errors, rate limits and copy-paste examples for Godot, Unity, JavaScript and curl.',
};

const SECTIONS = [
    { id: 'quick-start', label: 'Quick start' },
    { id: 'write-keys', label: 'Write keys' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'paging', label: 'Paging' },
    { id: 'errors', label: 'Errors' },
    { id: 'rate-limits', label: 'Rate limits' },
    { id: 'examples', label: 'Examples' },
    { id: 'legacy', label: 'Older endpoints' },
];

const QUICK_START: { title: string; text: string; href: Route; link: string }[] = [
    {
        title: 'Make an account',
        text: 'Sign up, then open the console.',
        href: '/auth/sign-up',
        link: 'Sign up',
    },
    {
        title: 'Create an app',
        text: 'Copy its App ID and the write key, which is shown once.',
        href: '/create-app',
        link: 'Create an app',
    },
    {
        title: 'Send a score',
        text: 'POST to the endpoint with the key in a header.',
        href: '/docs#examples' as Route,
        link: 'See examples',
    },
];

const PLAYER_EXAMPLE = {
    id: '4572ab60-9ee1-43fa-b364-37046a00e5e1',
    name: 'Benjamin Thio',
    score: 999,
    datetime: 'Tue, 28 Oct 2025 07:00:12 GMT',
    rank: 1,
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <Reveal as="section" className="border-t border-white/5 pt-10 first:border-t-0 first:pt-0">
            <h2 id={id} className="group flex scroll-mt-20 items-center gap-3 text-2xl font-bold sm:text-3xl">
                {title}
                <a
                    href={`#${id}`}
                    aria-label={`Link to ${title}`}
                    className="text-lg text-subtle opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                    #
                </a>
            </h2>
            <div className="mt-5 flex flex-col gap-5 font-pixel-sm text-base leading-relaxed text-muted">
                {children}
            </div>
        </Reveal>
    );
}

interface CodeBlockProps {
    code: string;
    language: CodeLanguage;
    label: string;
    /** Wrap long lines (commands) instead of scrolling sideways. */
    wrap?: boolean;
}

function CodeBlock({ code, language, label, wrap = false }: CodeBlockProps) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-editor/90 shadow-glow">
            <div className="flex items-center justify-between border-b-2 border-editor-edge bg-editor-edge px-3 py-1.5 text-xs text-muted">
                {label}
                <CopyButton value={code} label={`Copy ${label}`} />
            </div>
            <pre
                tabIndex={0}
                className={cn(
                    'max-h-[26rem] overflow-auto p-4 font-pixel text-[13px] leading-relaxed text-white sm:text-sm',
                    wrap && 'break-all whitespace-pre-wrap',
                )}
            >
                <code dangerouslySetInnerHTML={{ __html: highlightHtml(code, language) }} />
            </pre>
        </div>
    );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
                <thead className="bg-surface text-subtle">
                    <tr>
                        {head.map((cell) => (
                            <th key={cell} scope="col" className="px-4 py-3 font-normal whitespace-nowrap">
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-t border-white/5 align-top">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EndpointCard({ endpoint, api }: { endpoint: Endpoint; api: string }) {
    const example = {
        GET: `curl -i "${api}?appId=YOUR_APP_ID&limit=10"`,
        POST: `curl -X POST "${api}?appId=YOUR_APP_ID&name=Benjamin%20Thio&score=999" \\\n  -H "${WRITE_KEY_HEADER}: YOUR_WRITE_KEY"`,
        PUT: `curl -X PUT "${api}?appId=YOUR_APP_ID&playerId=PLAYER_ID&score=1200" \\\n  -H "${WRITE_KEY_HEADER}: YOUR_WRITE_KEY"`,
        DELETE: `curl -X DELETE "${api}?appId=YOUR_APP_ID&playerId=PLAYER_ID" \\\n  -H "${WRITE_KEY_HEADER}: YOUR_WRITE_KEY"`,
    }[endpoint.method];

    const response =
        endpoint.method === 'GET'
            ? [
                  PLAYER_EXAMPLE,
                  {
                      ...PLAYER_EXAMPLE,
                      id: 'ba9ebdf3-6378-41d8-89e9-5888129b7296',
                      name: 'Teh Yi Fan',
                      score: 980,
                      rank: 2,
                  },
              ]
            : {
                  success: endpoint.method === 'DELETE' ? { id: PLAYER_EXAMPLE.id } : PLAYER_EXAMPLE,
                  leaderboard: [PLAYER_EXAMPLE],
              };

    return (
        <article
            id={`endpoint-${endpoint.method.toLowerCase()}`}
            className="scroll-mt-20 rounded-2xl border border-white/[0.06] bg-surface p-5 sm:p-6"
        >
            <header className="flex flex-wrap items-center gap-3">
                <span
                    className={cn(
                        'w-20 rounded-md py-1 text-center font-pixel text-sm font-bold',
                        METHOD_STYLES[endpoint.method],
                    )}
                >
                    {endpoint.method}
                </span>
                <code className="min-w-0 truncate font-pixel text-white">
                    /api/leaderboard<span className="text-muted">{endpoint.query}</span>
                </code>
                {endpoint.needsWriteKey ? (
                    <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                        <Icon icon={faKey} /> Write key
                    </span>
                ) : null}
            </header>
            <p className="mt-4">
                <InlineCode text={endpoint.description} />
            </p>

            <div className="mt-5">
                <Table
                    head={['Parameter', 'Required', 'Description']}
                    rows={endpoint.parameters.map((parameter) => [
                        <code key="name" className="text-white">
                            {parameter.name}
                        </code>,
                        parameter.required ? <span className="text-accent">Yes</span> : 'No',
                        <InlineCode key="description" text={parameter.description} />,
                    ])}
                />
            </div>

            <p className="mt-5 text-sm">
                <span className="text-white">Returns</span> <InlineCode text={endpoint.success} />.
                {endpoint.responseHeaders ? (
                    <span className="mt-2 block">
                        {endpoint.responseHeaders.map((header) => (
                            <span key={header} className="block">
                                <InlineCode text={header} />
                            </span>
                        ))}
                    </span>
                ) : null}
            </p>

            <div className="mt-5 grid items-start gap-4 xl:grid-cols-2">
                <CodeBlock label="Request" language="bash" code={example} wrap />
                <CodeBlock label="Response" language="json" code={JSON.stringify(response, null, 2)} />
            </div>
        </article>
    );
}

export default async function DocsPage() {
    const origin = await getRequestOrigin();
    const api = `${origin}/api/leaderboard`;
    const samples = buildCodeSamples(origin).map((sample) => ({
        id: sample.id,
        filename: sample.filename,
        code: sample.code,
        html: highlightHtml(sample.code, sample.language),
    }));

    return (
        <PageTransition>
            <div className="relative isolate border-b border-white/5">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-line-grid [mask-image:radial-gradient(ellipse_70%_80%_at_50%_0%,black,transparent)]"
                />
                <Container className="py-14 sm:py-20">
                    <p className="flex animate-fade-up items-center gap-2 font-pixel-sm text-sm tracking-widest text-accent uppercase">
                        <Icon icon={faBookOpen} /> {'// docs'}
                    </p>
                    <h1 className="mt-4 max-w-3xl animate-fade-up text-4xl leading-tight font-bold text-balance sm:text-5xl">
                        The leaderboard API, start to finish.
                    </h1>
                    <p className="mt-5 max-w-2xl animate-fade-up font-pixel-sm text-lg leading-relaxed text-muted [animation-delay:100ms]">
                        One endpoint, four HTTP verbs, JSON back. No SDK: if your engine can make a web
                        request, it can use LASMA.
                    </p>
                    <div className="mt-8 flex max-w-2xl animate-fade-up items-center gap-2 rounded-xl border border-white/10 bg-surface py-2 pr-2 pl-4 [animation-delay:150ms]">
                        <span className="shrink-0 font-pixel-sm text-xs tracking-widest text-subtle uppercase">
                            Base URL
                        </span>
                        <code className="min-w-0 grow truncate text-sm text-white select-all sm:text-base">
                            {api}
                        </code>
                        <CopyButton value={api} label="Copy the base URL" />
                    </div>
                </Container>
            </div>

            <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14">
                <nav aria-label="On this page" className="hidden lg:block">
                    <ul className="sticky top-20 flex flex-col gap-1 font-pixel-sm">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="block rounded-lg px-3 py-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex min-w-0 flex-col gap-12">
                    <Section id="quick-start" title="Quick start">
                        <ol className="grid gap-3 sm:grid-cols-3">
                            {QUICK_START.map((step, index) => (
                                <li
                                    key={step.title}
                                    className="rounded-xl border border-white/[0.06] bg-surface p-4"
                                >
                                    <span className="font-mars text-2xl text-accent">{index + 1}.</span>
                                    <p className="mt-2 text-lg text-white">{step.title}</p>
                                    <p className="mt-1 text-sm">{step.text}</p>
                                    <Link
                                        href={step.href}
                                        className="mt-3 inline-block text-sm text-accent hover:underline"
                                    >
                                        {step.link} →
                                    </Link>
                                </li>
                            ))}
                        </ol>
                        <p>
                            Parameters can go in the query string, a JSON body (
                            <code className="text-white">application/json</code>) or a form body (
                            <code className="text-white">application/x-www-form-urlencoded</code>), whichever
                            your engine makes easy. Body values win over the query string. Bodies are limited
                            to 16 KB.
                        </p>
                    </Section>

                    <Section id="write-keys" title="Write keys">
                        <p>
                            Reading a board is open to anyone with its App ID. Changing it (POST, PUT, DELETE)
                            needs the app&apos;s write key in the{' '}
                            <code className="text-white">{WRITE_KEY_HEADER}</code> header. Keys start with{' '}
                            <code className="text-white">lsk_</code>, are shown once when you create the app,
                            and are stored only as a hash, so nobody (us included) can read them back.
                        </p>
                        <ul className="flex list-inside list-disc flex-col gap-2">
                            <li>
                                Lost it, or it leaked? Generate a new one on the app&apos;s edit page. The old
                                key stops working at once.
                            </li>
                            <li>
                                Engines that can&apos;t set headers may send it as a{' '}
                                <code className="text-white">key</code> parameter instead, but it will then
                                show up in logs along with the rest of the URL.
                            </li>
                            <li>
                                Apps made before write keys existed accept writes without one until you
                                generate a key. After that, the key is required.
                            </li>
                            <li>
                                Web builds ship their code to the player, key included. Rate limits, the
                                Disabled status and key rotation are your safety net there.
                            </li>
                        </ul>
                    </Section>

                    <Section id="endpoints" title="Endpoints">
                        <p>
                            Every call returns JSON. Writes return the affected player as{' '}
                            <code className="text-white">success</code> plus the top of the board as{' '}
                            <code className="text-white">leaderboard</code>, so a game can show the new
                            ranking without a second request.
                        </p>
                        {ENDPOINTS.map((endpoint) => (
                            <EndpointCard key={endpoint.method} endpoint={endpoint} api={api} />
                        ))}
                    </Section>

                    <Section id="paging" title="Paging">
                        <p>
                            Boards come back {PAGE_SIZE.apiDefault} rows at a time (up to {PAGE_SIZE.apiMax}{' '}
                            with <code className="text-white">limit</code>). Each response carries an{' '}
                            <code className="text-white">X-Next-Cursor</code> header; send it back as{' '}
                            <code className="text-white">cursor</code> to get the next page. An empty header
                            means you have reached the end. Cursors are opaque: don&apos;t build them
                            yourself.
                        </p>
                        <CodeBlock
                            label="Read a whole board"
                            language="javascript"
                            code={`async function readWholeBoard(appId) {
  const players = [];
  let cursor = '';

  do {
    const params = new URLSearchParams({ appId, limit: '${PAGE_SIZE.apiMax}' });
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(\`${api}?\${params}\`);
    if (!response.ok) throw new Error((await response.json()).error);

    players.push(...(await response.json()));
    cursor = response.headers.get('X-Next-Cursor') ?? '';
  } while (cursor);

  return players;
}`}
                        />
                    </Section>

                    <Section id="errors" title="Errors">
                        <p>
                            Failures use normal HTTP status codes and a JSON body with a human-readable{' '}
                            <code className="text-white">error</code> and a stable{' '}
                            <code className="text-white">code</code> you can branch on.
                        </p>
                        <CodeBlock
                            label="Error body"
                            language="json"
                            code={JSON.stringify(
                                { error: 'The write key is not valid for this app.', code: 'unauthorized' },
                                null,
                                2,
                            )}
                        />
                        <Table
                            head={['Status', 'Code', 'Meaning']}
                            rows={ERRORS.map((error) => [
                                <span key="status" className="font-mars text-white">
                                    {error.status}
                                </span>,
                                <code key="code" className="text-white">
                                    {error.code}
                                </code>,
                                <InlineCode key="meaning" text={error.meaning} />,
                            ])}
                        />
                    </Section>

                    <Section id="rate-limits" title="Rate limits">
                        <Table
                            head={['Scope', 'Limit']}
                            rows={RATE_LIMIT_SUMMARY.map((row) => [
                                row.scope,
                                <span key="limit" className="text-white">
                                    {row.limit}
                                </span>,
                            ])}
                        />
                        <p>
                            Writes report what is left in{' '}
                            <code className="text-white">X-RateLimit-Remaining</code>. Over the limit you get
                            a <code className="text-white">429</code> with a{' '}
                            <code className="text-white">Retry-After</code> header in seconds. Submit a score
                            when a run ends rather than every frame, and you will never see one.
                        </p>
                        <p>
                            CORS is open (<code className="text-white">Access-Control-Allow-Origin: *</code>)
                            and the API never uses cookies, so web builds on any domain can call it directly.
                        </p>
                    </Section>

                    <Section id="examples" title="Examples">
                        <p>Copy, paste your App ID and write key, done.</p>
                        <CodeTabs samples={samples} name="docs-sample" />
                    </Section>

                    <Section id="legacy" title="Older endpoints">
                        <p>
                            <code className="text-white">GET /api/app?uuid=APP_ID</code> still returns an
                            app&apos;s public details for games built against the first version of LASMA.
                            Creating, editing and deleting apps through{' '}
                            <code className="text-white">/api/app</code> is retired (
                            <code className="text-white">410 Gone</code>): manage apps from the{' '}
                            <Link
                                href="/console"
                                className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                            >
                                console
                            </Link>{' '}
                            instead.
                        </p>
                    </Section>
                </div>
            </Container>
        </PageTransition>
    );
}
