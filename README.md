# LASMA Studio

Hosted leaderboards for indie games. Create an app, copy its keys, and post scores from Godot, Unity, a web
build or plain `curl`.

Built with **Next.js 16** (App Router, React 19, React Compiler), **Tailwind CSS v4**, **Bun**, and
**Firestore** through the Firebase Admin SDK (server-side only).

## Quick start

```bash
bun install
bun run dev
```

Open http://localhost:3000. Without Firebase credentials the dev server uses an **in-memory data store**
seeded with demo apps (one has 240 players, to show paging). It resets on every restart. Password reset
emails are printed to the terminal instead of being sent.

> Requires **Bun 1.4.2 or newer** (`bun upgrade`). Bun 1.3.x has a Windows bug that crashes
> `bun --bun next build` ("Expected CommonJS module to have a function wrapper").

## Features

- **Leaderboard API**: one endpoint, cursor paging, write keys, CORS, rate limits. Full reference at `/docs`.
- **Console**: create, edit, hide and delete apps; rotate write keys; reset a board; remove single players
  from the leaderboard page.
- **Accounts**: sign up / log in, "remember me", password reset by email, Sign in with Google, and an
  account page for avatar, username, email, password, connected sign-in methods, active sessions (sign
  out other devices) and account deletion.
- **Site**: landing page, app gallery, component playgrounds, games, privacy and terms pages, sitemap,
  robots, web manifest, icons and a generated social image.

## Scripts

| Script                            | What it does                                                          |
| --------------------------------- | --------------------------------------------------------------------- |
| `bun run dev`                     | Dev server (Turbopack) on the Bun runtime                             |
| `bun run build` / `bun run start` | Production build / server                                             |
| `bun run smoke [url]`             | Read-only checks of pages, headers and the API against a running site |
| `bun run check`                   | Type-check, lint and formatting check (CI runs this)                  |
| `bun run format`                  | Format everything with Prettier (+ Tailwind class sorting)            |
| `bun run migrate:legacy`          | Dry-run clean-up of data from the first version (`--apply` to write)  |

## Environment

Copy `.env.example` to `.env` for local work, or set the variables in your host's dashboard. Only
`NEXT_PUBLIC_SITE_URL` reaches the browser (it is baked in at build time).

| Variable                                                               | Needed                 | Purpose                                                 |
| ---------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                 | Production             | Public origin for metadata, sitemap, reset links, OAuth |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Production             | Service account (Project settings → Service accounts)   |
| `DATA_DRIVER`                                                          | Optional               | Force `firestore` or `memory`                           |
| `FIRESTORE_EMULATOR_HOST`                                              | Optional               | Use the local Firestore emulator                        |
| `RESEND_API_KEY`, `EMAIL_FROM`                                         | For password resets    | Transactional email through Resend                      |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                             | For Google sign-in     | OAuth web client                                        |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                   | With several instances | Shared rate-limit counters                              |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`                                   | With several instances | Same Server Action key on every instance                |

The old client-side `FIREBASE_API_KEY`-style variables are no longer used and can be deleted. On boot, the
server logs a warning for anything important that is missing.

## Deploying

The app is a standard Next.js server. It needs a Node-compatible runtime (Bun or Node), outbound HTTPS to
Google (Firestore) and, if configured, Resend and Upstash. `GET /api/health` is a free liveness probe.

### Docker (Cloud Run, Fly.io, Railway, a VPS)

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://lasma.example -t lasma .
docker run -p 3000:3000 --env-file .env lasma
bun run smoke https://lasma.example
```

The image uses Next's standalone output on `oven/bun`, runs as a non-root user and has a health check.
Put it behind HTTPS: cookies are `Secure` and the CSP upgrades insecure requests in production. If you run
more than one instance, set the two "several instances" variables above.

### Vercel

Import the repository; Vercel detects Bun from `bun.lock`. Add the environment variables, set
`NEXT_PUBLIC_SITE_URL` to your production domain, and redeploy. Serverless functions scale out, so set the
Upstash variables for rate limits that hold across instances.

### After the first deploy

1. **Firestore rules, indexes and TTL policies.** The browser never talks to Firestore, so deploy the
   deny-all rules, the index exemptions and the TTL policies that purge expired sessions and reset links:
   ```bash
   bunx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```
   Until you do this, the old open rules still let anyone read the database directly.
2. **Legacy data.** The first version stored plaintext passwords and kept leaderboards inside app documents.
   Both are fixed lazily (on login / first read); the script fixes everything at once and also records which
   apps have thumbnails, so listings can use the shared placeholder image:
   ```bash
   bun run migrate:legacy          # shows what would change
   bun run migrate:legacy --apply
   ```
   Existing users must log in again (old sessions were never secret and are not accepted).
3. **Email.** Verify your sending domain in Resend and set `EMAIL_FROM` to an address on it.
4. **Google sign-in.** Create an OAuth client (type: Web application) and add
   `https://<your domain>/api/auth/google/callback` as an authorised redirect URI.
5. **Check it.** `bun run smoke https://<your domain>`.

## Project layout

```
src/
  app/                 Routes. (site) has the footer, (auth) holds login, sign-up and password recovery.
                       api/ holds route handlers; icon, manifest and social image live here too.
  components/          ui/ primitives, layout/ (navbar, footer), and one folder per feature
  config/              Site, navigation, games, API docs data and static image imports
  hooks/               Client hooks (dismissable popovers, chunked lists, tilt)
  lib/                 Isomorphic code: domain types, constants, password rules, formatting, colour maths
  server/              Server-only code (guarded by `server-only`)
    actions/           Server Actions (auth, account, apps)
    auth/              scrypt passwords, hashed session tokens, current user, Google OAuth
    db/                Repository interfaces + Firestore and in-memory implementations
    services/          Business rules shared by pages, actions and the API
    security/          Rate limiting (memory or Upstash), request helpers, crypto
  instrumentation.ts   Boot-time configuration warnings
  proxy.ts             Per-request nonce CSP and optimistic auth redirects
scripts/               Maintenance and smoke-test scripts
```

## Public API

Everything goes through `/api/leaderboard`; the full reference with examples is served at **`/docs`**.

| Method   | Parameters                             | Notes                                                                                         |
| -------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `GET`    | `appId`, `limit` (≤100), `cursor`      | Best score first. First page sets `X-Total-Count`; pass `X-Next-Cursor` back as `cursor`.     |
| `POST`   | `appId`, `name`, `score`, `playerId?`  | `201` for a new player, `200` when `playerId` already exists (update). Returns rank + top 10. |
| `PUT`    | `appId`, `playerId`, `name?`, `score?` | Rename and/or re-score a player.                                                              |
| `DELETE` | `appId`, `playerId`                    | Remove a player.                                                                              |

Writes need the app's write key in the `X-Api-Key` header. `GET /api/app?uuid=` still returns public app
details; the old unauthenticated app-management endpoints are retired (`410`).

## Security notes

- Passwords: scrypt (N=2¹⁵, r=8, p=3) with per-user salt, timing-safe comparisons, dummy work for unknown
  emails, and a policy that rejects common passwords and passwords containing the username or email.
- Sessions: random 256-bit tokens in an `HttpOnly`, `SameSite=Lax`, `__Host-` cookie; only a SHA-256 of the
  token is stored, with server-side expiry. Changing a password or email signs out other devices.
- Password reset: single-use links (hashed, 30 minutes), sent after the response so the form never reveals
  whether an account exists; links are built from `NEXT_PUBLIC_SITE_URL`, never the request's `Host`.
- Google sign-in: authorization code flow with PKCE, `state` and `nonce`. A Google identity is only linked
  to an existing account from that account's own settings page, which blocks pre-registration takeovers.
- Write keys are shown once and stored as SHA-256 hashes.
- Strict nonce-based CSP, HSTS, `frame-ancestors 'none'`, COOP and no-sniff on every page.
- Rate limits on login, sign-up, password reset, account changes, app mutations and the public API, shared
  across instances through Upstash when configured.
- Uploaded images are checked by file signature, size-limited, re-encoded to WebP (stripping metadata) and
  served from sandboxed routes, never inline as HTML.
- Private apps and other people's apps are indistinguishable from missing ones.

## Games

The exported games in `public/` are embedded on their own pages. The Godot exports use threads, so those
pages are cross-origin isolated (`COOP`/`COEP` headers in `next.config.ts`); links to them are full page
loads, and the embed reloads itself once if reached by client-side navigation.
