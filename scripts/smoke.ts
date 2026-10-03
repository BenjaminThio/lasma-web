/**
 * Post-deploy smoke test. Read-only: it creates no accounts and writes no scores, so it is safe to
 * point at production.
 *
 *   bun run smoke                         # http://localhost:3000
 *   bun run smoke https://lasma.example   # a deployment
 */

export {};

const base = (process.argv[2] ?? process.env.SMOKE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

interface Check {
    name: string;
    path: string;
    method?: string;
    expectStatus: number | number[];
    expectHeaders?: Record<string, RegExp>;
    expectBody?: RegExp;
}

const PAGE_HEADERS = {
    'content-security-policy': /script-src 'self' 'nonce-/,
    'x-content-type-options': /nosniff/,
    'x-frame-options': /DENY/,
    'referrer-policy': /strict-origin-when-cross-origin/,
};

const checks: Check[] = [
    { name: 'Health', path: '/api/health', expectStatus: 200, expectBody: /"status":"ok"/ },
    { name: 'Landing page', path: '/', expectStatus: 200, expectHeaders: PAGE_HEADERS, expectBody: /LASMA/ },
    { name: 'Apps gallery', path: '/apps', expectStatus: 200, expectHeaders: PAGE_HEADERS },
    { name: 'API docs', path: '/docs', expectStatus: 200, expectBody: /\/api\/leaderboard/ },
    { name: 'Login', path: '/auth/login', expectStatus: 200 },
    { name: 'Sign up', path: '/auth/sign-up', expectStatus: 200 },
    { name: 'Forgot password', path: '/auth/forgot-password', expectStatus: 200 },
    { name: 'Privacy', path: '/privacy', expectStatus: 200 },
    { name: 'Terms', path: '/terms', expectStatus: 200 },
    { name: 'Lightbulb component', path: '/components/apps', expectStatus: 200 },
    { name: 'Console redirects when signed out', path: '/console', expectStatus: [307, 308] },
    { name: 'Account redirects when signed out', path: '/account', expectStatus: [307, 308] },
    { name: 'Unknown page is a 404', path: '/definitely-not-a-page', expectStatus: 404 },
    {
        name: 'Public apps API',
        path: '/api/apps?scope=public&limit=1',
        expectStatus: 200,
        expectBody: /"items":\[/,
    },
    { name: 'My apps API needs a session', path: '/api/apps?scope=mine', expectStatus: 401 },
    {
        name: 'Leaderboard API validates input',
        path: '/api/leaderboard',
        expectStatus: 400,
        expectHeaders: { 'access-control-allow-origin': /\*/ },
        expectBody: /"code":"bad_request"/,
    },
    {
        name: 'Leaderboard API hides unknown apps',
        path: '/api/leaderboard?appId=smoke-test-missing-app',
        expectStatus: 404,
    },
    {
        name: 'Writes without a key are rejected',
        path: '/api/leaderboard?appId=smoke-test-missing-app&name=Smoke&score=1',
        method: 'POST',
        expectStatus: [401, 404],
    },
    {
        name: 'CORS preflight',
        path: '/api/leaderboard',
        method: 'OPTIONS',
        expectStatus: 204,
        expectHeaders: { 'access-control-allow-headers': /X-Api-Key/i },
    },
    { name: 'Retired app API', path: '/api/app', method: 'POST', expectStatus: 410 },
    { name: 'Manifest', path: '/manifest.webmanifest', expectStatus: 200, expectBody: /"short_name"/ },
    { name: 'Icon', path: '/icon.svg', expectStatus: 200 },
    {
        name: 'Social image',
        path: '/opengraph-image',
        expectStatus: 200,
        expectHeaders: { 'content-type': /image\/png/ },
    },
    { name: 'robots.txt', path: '/robots.txt', expectStatus: 200, expectBody: /Sitemap:/ },
    { name: 'sitemap.xml', path: '/sitemap.xml', expectStatus: 200, expectBody: /<urlset/ },
];

let failures = 0;

for (const check of checks) {
    const started = performance.now();
    const problems: string[] = [];

    try {
        const response = await fetch(base + check.path, {
            method: check.method ?? 'GET',
            redirect: 'manual',
        });
        const body = check.expectBody ? await response.text() : '';
        const expected = Array.isArray(check.expectStatus) ? check.expectStatus : [check.expectStatus];

        if (!expected.includes(response.status))
            problems.push(`status ${response.status}, expected ${expected.join(' or ')}`);
        for (const [header, pattern] of Object.entries(check.expectHeaders ?? {})) {
            const value = response.headers.get(header);
            if (!value || !pattern.test(value)) problems.push(`header ${header} = ${value ?? '(missing)'}`);
        }
        if (check.expectBody && !check.expectBody.test(body))
            problems.push(`body does not match ${check.expectBody}`);
    } catch (error) {
        problems.push(error instanceof Error ? error.message : String(error));
    }

    const time = `${Math.round(performance.now() - started)}ms`.padStart(7);
    if (problems.length === 0) {
        console.info(`  ok   ${time}  ${check.name}`);
    } else {
        failures += 1;
        console.error(`  FAIL ${time}  ${check.name}: ${problems.join('; ')}`);
    }
}

console.info(`\n${checks.length - failures}/${checks.length} checks passed against ${base}`);
process.exit(failures === 0 ? 0 : 1);
