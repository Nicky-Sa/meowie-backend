# Meowie Backend — Senior-Level Analysis

## What You Already Have (This Is Genuinely Good)

Before talking about gaps, let's acknowledge what's already here — because some of this is *not* stuff most "frontend devs who know backend" build:

| Area | What You Did | Why It's Senior |
|------|-------------|-----------------|
| **Rotating Refresh Tokens** | Hash stored in DB, token-mismatch → invalidate all sessions | This is a real-world security pattern. You didn't just do JWT, you did JWT *correctly*. |
| **Custom `@Cacheable` decorator** | Method-level caching via a decorator that introspects `cacheService` | This is framework-level engineering — you built a cross-cutting concern using metaprogramming. |
| **BullMQ background jobs** | Email + image processing offloaded to Redis-backed queues with retry/backoff | Decoupling heavy work from request cycle is a textbook senior move. |
| **Zod env validation** | Typed env with Zod schemas, separate `app` vs `migrator` configs | Fail-fast on boot with typed config. Most backends just do `process.env.X || ''`. |
| **DB role separation** | `meowie_app` (limited CRUD) vs `meowie_migrator` (DDL) with pooled/direct connections | This is actual production DB security. Least-privilege principle applied correctly. |
| **Sentry integration** | Only captures 5xx, has `sendDefaultPii: false`, release tracking | Thoughtful observability — not just "throw Sentry everywhere". |
| **CI/CD pipeline** | Version calc → build → Sentry sourcemaps → DB migration → ECR push → VPS deploy → healthcheck | This is a full production pipeline with rollback awareness and health verification. |
| **Sensitive data redaction** | Recursive redaction in logs, env-aware | Shows security consciousness in logging. |
| **Docker healthcheck** | Container-level health monitoring with retries | Production-grade container hygiene. |
| **Abstract service pattern** | `EmailService` abstract → `SesService` concrete, `CacheService` abstract → `RedisService` | Clean DI inversion — swappable implementations. |
| **Collection sync cron jobs** | Automated scraping + TMDB mapping with transactional saves | Shows data pipeline thinking. |
| **TypeORM `invalidWhereValuesBehavior: 'throw'`** | Prevents silent `WHERE null` bugs | Defensive database config — most devs never set this. |

---

## The Gaps — What Would Make This Truly Senior

### 1. 🧪 Testing (The Biggest Gap)

**Current state:** Zero test files exist. Jest is configured but there isn't a single `.spec.ts` file in the entire `src/` directory.

**Why this is a dealbreaker on a resume:** A senior engineer's code is not just code that works — it's code that *proves* it works. No interviewer will take "I built background queues with retry logic" seriously if you can't show how you verified the retry logic actually retries.

**What to add:**

| Test Type | What To Test | Signal It Sends |
|-----------|-------------|-----------------|
| **Unit tests** | `AuthService.verifyOtp()` (happy path, expired OTP, invalid OTP), `MovieService.screeningStatus()` (premiere today, upcoming, in cinemas, past), `@Cacheable` decorator (cache hit, cache miss, no `cacheService`) | "I isolate business logic and test edge cases" |
| **Integration tests** | `LibraryService.markAsSeen()` with a real test DB (e.g. Testcontainers for Postgres), testing the unique-constraint upsert behavior | "I validate real database interactions, not mocks" |
| **E2E tests** | Auth flow: request OTP → verify → access protected route → refresh → access again → logout → verify blocked | "I validate the full auth lifecycle" |

> [!TIP]
> Start with **unit tests for `AuthService` and `MovieService`** — they have the most interesting logic. Use `@nestjs/testing`'s `Test.createTestingModule()` to mock dependencies.

**Resume bullet after:**
> *Achieved X% test coverage with unit, integration, and E2E test suites using Jest and Testcontainers, covering auth flows, cache decorators, and background job retry logic*

---

### 2. 🔌 Graceful Shutdown & Lifecycle Management

**Current state:** The app has `onModuleInit` / `onModuleDestroy` for Redis, but no app-level graceful shutdown. If the VPS deployment sends SIGTERM, in-flight requests and active BullMQ jobs could be killed mid-execution.

**What to add:**

```typescript
// main.ts
app.enableShutdownHooks(); // NestJS will listen for SIGTERM/SIGINT

// In your queue processors, implement onModuleDestroy to pause workers
// In your Redis service, ensure disconnect happens AFTER in-flight operations
```

Also consider:
- A `/health` endpoint (liveness) and `/ready` endpoint (readiness) for proper container orchestration
- The Dockerfile `HEALTHCHECK` currently hits the root — it should hit a dedicated health endpoint that verifies DB + Redis connectivity

**Why it matters:** Your CI/CD pipeline already does a healthcheck loop — but the healthcheck itself doesn't verify that the app *can actually serve requests* (DB connected, Redis connected, queues operational). A senior engineer builds health endpoints that are honest.

**Resume bullet after:**
> *Implemented graceful shutdown with in-flight request draining, dedicated health/readiness endpoints verifying DB and Redis connectivity, and zero-downtime container deployments*

---

### 3. 📊 Structured Logging & Observability

**Current state:** `LoggingInterceptor` logs request/response with duration, but it's just `console.log`-style NestJS Logger output. No correlation IDs, no structured JSON in production, no way to trace a request across the queue boundary.

**What to add:**

- **Request correlation IDs**: Generate a UUID per request (middleware), attach to all logs, pass it through to BullMQ job metadata
- **Structured JSON logging in prod**: Use `pino` or `winston` with JSON transport for production, keeping pretty-print for dev
- **Queue observability**: Log when jobs are enqueued, completed, and failed with the correlation ID

```
// Example trace: "User 42 hit /movie/info/550 → cache miss → enqueued blurhash job abc-123 → job completed in 340ms"
```

**Why it matters:** When something goes wrong in production at 3am, "can I trace a user's request from the API, through the queue, to the worker, and back?" is the question that separates senior from mid-level.

**Resume bullet after:**
> *Built request-scoped correlation tracing across REST endpoints and BullMQ workers, with structured JSON logging in production for searchable log aggregation*

---

### 4. 🔄 API Versioning

**Current state:** All routes are unversioned (`/auth/request-otp`, `/movie/info/:id`). The React Native client is already consuming these.

**Why it matters:** The moment you deploy a breaking change, every app that hasn't updated will crash. Mobile apps have a slow update cycle — you *can't* force users to update instantly.

**What to add:**

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

// Controllers become /v1/movie/info/:id
// When you need a breaking change, add @Version('2') alongside v1
```

**Resume bullet after:**
> *Implemented URI-based API versioning to maintain backward compatibility across mobile client release cycles*

---

### 5. 🔒 CORS Hardening

**Current state:**
```typescript
app.enableCors({
  origin: '*',  // 🚨 Allows any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Why it matters:** `origin: '*'` in production means anyone can make credentialed requests to your API. For a mobile app this is less critical (native apps don't have CORS), but if you ever add a web client or admin panel, this is a vulnerability.

**What to add:**

```typescript
app.enableCors({
  origin: env.get('BUILD_ENV') === 'production'
    ? ['https://your-admin.meowie.app']
    : true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

---

### 6. 🐳 Multi-Stage Dockerfile

**Current state:** Single-stage Dockerfile that copies pre-built `dist/` from the CI runner. This works, but it's tightly coupled to the CI environment.

**What to add:**

```dockerfile
# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage  
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

CMD ["npm", "run", "start:deployed"]
```

**Why it matters:** Running as root inside a container is a security red flag. Multi-stage builds also make the image self-contained (buildable anywhere, not just your CI).

**Resume bullet after:**
> *Containerized with multi-stage Docker builds, non-root execution, and dedicated health probes for production container orchestration*

---

### 7. 🔑 Idempotency for State-Changing Operations

**Current state:** `markAsSeen`, `markAsSaved`, etc. use an update-then-insert pattern with unique constraint checking. This is solid, but there's no protection against network retries sending the same request twice for operations like `deleteAccount`.

**What to add:** Idempotency keys for critical mutations:

```typescript
// Client sends: POST /library/seen
// Header: X-Idempotency-Key: <uuid>

// Server checks Redis for this key before processing
// If found → return cached response
// If not found → process, cache response for 24h
```

**Why it matters:** Mobile networks are flaky. Users tap buttons twice. An idempotent API is the difference between "the app works great" and "I accidentally deleted my account twice."

**Resume bullet after:**
> *Implemented idempotency-key middleware for critical state mutations, preventing duplicate operations from unreliable mobile network conditions*

---

### 8. 🗑️ Cache Invalidation Strategy

**Current state:** `@Cacheable` caches with TTLs, but there's no active invalidation. When a user marks a movie as "seen," the cached `movie-info-{id}` doesn't update. The `collections` cache is TTL-based but the sync job doesn't invalidate it.

**What to add:**

- After `CollectionsSyncService.saveItems()` completes, invalidate `collections-*` cache keys
- Add a `@CacheInvalidate` decorator or explicit `cacheService.del()` calls in mutation paths
- Consider a `cacheService.delByPattern('collections-*')` method using Redis `SCAN`

**Why it matters:** TTL-only caching is fine for TMDB data (it doesn't change often), but for user-generated data and synced collections, stale cache = stale UI. A senior engineer thinks about *when* to invalidate, not just *when* to cache.

**Resume bullet after:**
> *Designed a hybrid cache strategy with TTL-based caching for external API data and event-driven invalidation for user-mutable state, using Redis SCAN for pattern-based eviction*

---

## Priority Order (What to Tackle First)

| Priority | Item | Effort | Impact on Resume |
|----------|------|--------|-----------------|
| 🔴 **#1** | Testing | Medium-High | **Massive** — this is the single thing that will get asked about in every interview |
| 🟠 **#2** | Graceful Shutdown + Health endpoints | Low | High — shows production thinking |
| 🟠 **#3** | Structured Logging + Correlation IDs | Medium | High — shows observability mindset |
| 🟡 **#4** | Cache Invalidation | Low | Medium — you already have the cache infra |
| 🟡 **#5** | Dockerfile improvements | Low | Medium — quick win, shows security awareness |
| 🟢 **#6** | API Versioning | Low | Medium — easy to add, shows foresight |
| 🟢 **#7** | Idempotency | Medium | Medium — impressive but niche |
| 🟢 **#8** | CORS Hardening | Trivial | Low — but should be done regardless |

---

## The Resume Bullet (Combining Everything)

Here's what your resume bullet could look like after addressing the top items:

> **Meowie — Movie Discovery Platform** *(NestJS, TypeScript, PostgreSQL, Redis, BullMQ, Docker, AWS)*
>
> Designed and built a production backend serving a React Native mobile app. Key highlights:
> - JWT auth with rotating refresh tokens, hashed storage, and automatic session invalidation on token reuse
> - Redis-backed async job queues (BullMQ) for image processing and email delivery with exponential backoff retry
> - Custom `@Cacheable` method decorator with hybrid TTL + event-driven invalidation strategy
> - Automated data pipeline syncing curated collections from IMDb/Letterboxd via cron-scheduled scrapers
> - AI-powered search query refinement using Gemini for typo correction and semantic intent parsing
> - Full CI/CD pipeline: semantic versioning → Sentry sourcemaps → DB migrations → ECR → VPS deploy → health verification
> - X% test coverage with unit, integration, and E2E suites using Jest and Testcontainers

> [!IMPORTANT]
> The **single highest-ROI thing** you can do right now is write tests. Everything else is a bonus. A backend with zero tests doesn't survive technical scrutiny in a senior interview — no matter how good the architecture is.
