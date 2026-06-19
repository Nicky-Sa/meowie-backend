# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Meowie's backend: a NestJS REST API for a movie/TV discovery app. Wraps TMDB, adds
auth, a personal library, ratings, collections, and AI-assisted search/taste. Postgres
(Supabase) via TypeORM, Redis for cache/queues/rate-limiting, AWS SES for email.

## Commands

```bash
npm run start:dev          # Dev server, hot reload (reads .env.local)
npm run start:debug        # Same, with --debug
npm run start:repl         # NestJS REPL (entryFile repl) — inspect the DI graph live
npm run build              # nest build -> dist/
npm run lint               # eslint --fix
npm run format             # prettier --write
npm run test               # All unit tests (*.spec.ts under src/)
npm run test:watch
npm run test:e2e           # test/jest-e2e.json

# Run a single test file / single test
npx jest src/movie/movie.service.spec.ts
npx jest -t "partial test name"

# Migrations — driven by the `migrator` DB role (direct, unpooled connection).
# Generating/running needs the DB_MIGRATOR_* + DB_HOST_MIGRATOR env vars.
npm run migration:gen      # Generate ./migrations/auto<ts> from entity diffs
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Revert the last one
```

There is no `sync-email-template` script — the OTP email template is synced to SES
automatically (see Email below). Path alias `@/` maps to `src/`.

## Environment & config

All env vars are Zod-validated in `src/env/env.config.ts` and accessed **only** through
`EnvService.get(...)` — never `process.env` directly. The schema is the source of truth
for what's required; the app fails fast on boot if anything is missing or malformed.

- `BUILD_ENV` is `development | preview | production`. Ports: 5000 (production), 5001
  (preview). CORS is `*` in development, otherwise locked to `ALLOWED_DOMAIN` (and
  subdomains) via a generated regex.
- Two env schemas: `envConfig` (the full app) and `dbMigratorEnvConfig` (just the
  migrator DB creds, so migrations can run in CI without the full app env).
- Notable secrets: `TMDB_API_KEY`, `WHATSON_API_KEY` (collections data), `GEMINI_API_KEY`
  (AI), `CRON_SECRET` (protects the sync endpoint), `JWT_SECRET` / `JWT_REFRESH_SECRET`
  (≥100 chars), `GOOGLE_CLIENT_ID` / `APPLE_BUNDLE_ID` (social sign-in), AWS creds (SES),
  `REDIS_ENDPOINT`.

## Database

Postgres hosted on **Supabase**, schema `meowie`, migrations tracked in
`meowie_migrations`. `src/database/database.config.ts` builds two TypeORM data sources by
role:

- **`app`** — pooled (`DB_HOST_POOLING`, max 10), used by the running app via
  `TypeOrmModule.forRoot` with `autoLoadEntities`.
- **`migrator`** — direct/unpooled (`DB_HOST_MIGRATOR`, max 2), used by the TypeORM CLI
  (`src/database/data-source.ts`) for generate/run/revert.

Both connect over SSL pinned to the bundled `supabase-prod-ca-2021.crt`.
`invalidWhereValuesBehavior` is set to **throw** on `null`/`undefined` in WHERE clauses —
a stray `undefined` in a query is an error, not a silent full-table match. Entities live
next to their domain as `*.entity.ts`; `src/database/db-errors.util.ts` maps PG error
codes to friendly errors.

## Module map

Domain modules (each: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/`, some with
`entities/`):

`auth`, `user`, `otp`, `movie`, `series`, `person`, `search`, `library`, `ratings`,
`collections`, `taste`, `constants`.

Note it's `user` (singular). `movie`/`series`/`person`/`search` are read-through wrappers
over TMDB; `library`/`ratings`/`collections`/`taste` are user data backed by Postgres.

Cross-cutting / infrastructure:

- `env` — see above.
- `tmdb` — single client for the TMDB API; the content modules call it rather than
  hitting TMDB directly.
- `ai` — Vercel AI SDK + Google Gemini (`gemini-2.5-flash`). `AiService.textAutoCorrect`
  cleans up messy search queries before they hit TMDB; failures fall back to the raw input.
- `cache` — abstract `CacheService` implemented by Redis. Cache responses with the
  `@Cacheable({ key, ttl })` decorator (`src/cache/cacheable.decorator.ts`); it reads
  `this.cacheService` off the service instance, so a `@Cacheable` method's class **must**
  inject `cacheService`. Default TTL is one day.
- `email` — AWS SES. Sending goes through a **BullMQ** queue (`email-queue.service.ts` →
  `email.processor.ts`), not inline.
- `images` — poster processing: blurhash, dominant-color extraction (node-vibrant), sharp
  resizing. Puppeteer is also available here.
- `health` — `@nestjs/terminus` at `/health`; the Docker `HEALTHCHECK` hits it.
- `common` — interceptors, filters, CLS, and shared constants (`app.constants.ts`,
  including the `Duration` enum used for TTLs/throttle windows).

## Request lifecycle (set up in `main.ts` + `app.module.ts`)

Ordering of the global pieces matters; change them deliberately.

- **Versioning:** URI-based, default `1`. Every route is served under `/v1/...`.
- **Validation:** global `ValidationPipe({ whitelist: true, transform: true })` — unknown
  body fields are stripped, payloads are transformed to DTO instances.
- **Rate limiting:** global `ThrottlerGuard` backed by Redis, with three named limits
  (`short` 30/s, `medium` 20/10s, `long` 100/min).
- **Response envelope:** `ResponseInterceptor` wraps every success as
  `{ success: true, statusCode, data, timestamp }`. Controllers return the bare payload;
  the interceptor adds the envelope. Errors are normalized by `GlobalExceptionFilter`.
- **Errors / observability:** Sentry is wired via `@/instrument` (imported first in
  `main.ts`) and `SentryGlobalFilter`, which sits *before* `GlobalExceptionFilter` in the
  filter chain so exceptions are reported then formatted.
- **Logging / request context:** `ClsMiddleware` runs on every route to establish a
  request-scoped CLS context; `ClsLogger` (Winston, daily-rotated files under `logs/`) is
  the app logger and stamps logs with that context. `LoggingInterceptor` logs requests.
- **Other:** gzip compression for responses >1KB; Swagger at `/docs` in non-production
  with two bearer schemes named `jwt-access-docs` and `jwt-refresh-docs`.

## Auth

OTP-over-email → JWT. Flow: request OTP (`otp` module, emailed via SES) → exchange for a
short-lived **access** JWT plus a rotating **refresh** token (hashed with bcrypt in the
DB). Passport strategies in `src/auth/strategies/`; guards in `src/auth/guards/`:

- `AccessGuard` / `OptionalAccessGuard` — require / optionally read the access token.
- `RefreshGuard` — validates the refresh token on rotation.
- `CronGuard` — gates internal endpoints on the `x-cron-secret` header matching
  `CRON_SECRET` (used by the collections sync).

Google and Apple sign-in are also supported (`google-auth-library`, `apple-signin-auth`).

## Background work & scheduled jobs

- **BullMQ** over Redis (`BullModule.forRootAsync`, connection = `REDIS_ENDPOINT`).
  Default job options: 3 attempts, exponential backoff. Redis is shared across queues,
  cache, and the rate limiter.
- **Weekly collections sync:** `.github/workflows/cron-sync-collections.yml` POSTs to
  `/v1/collections/sync` (for both envs) with the `x-cron-secret` header every Sunday.
  There's no in-process scheduler — the cron lives in GitHub Actions.

## DTO convention

Request DTOs are **classes** (class-validator decorators, validated by the global pipe).
Response DTOs are plain **types**.

## Deployment

Push to the `preview` or `production` branch triggers
`.github/workflows/deploy-release.yml`:

1. Compute the next semver tag.
2. `npm run build`, upload source maps to Sentry, run DB migrations
   (`migration:run` against the migrator host).
3. Build a Docker image (`Dockerfile`: copies the prebuilt `dist/`, prod deps only) and
   push to **AWS ECR**.
4. SCP a generated `.env.local` to the **VPS**, then over SSH pull the image and restart
   the container (`meowie-<env>`), waiting on the Docker healthcheck.
5. Create a GitHub release — `-beta` prerelease for `preview`, full release for
   `production`.

CloudFront sits in front for caching/SSL. `scripts/setup-vps/` provisions a fresh VPS
(installs Docker, configures AWS CLI). The README's mention of Lightsail predates the
current generic-VPS setup.