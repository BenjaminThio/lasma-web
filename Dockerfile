# syntax=docker/dockerfile:1.7
#
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://lasma.example -t lasma .
#   docker run -p 3000:3000 --env-file .env lasma
#
# Produces a small standalone Next.js server running on Bun. Runtime secrets (Firebase, Resend,
# Google, Upstash) are passed as environment variables when the container starts, never baked in.

ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static
COPY --from=build --chown=bun:bun /app/public ./public

USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["bun", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT ?? 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["bun", "server.js"]
