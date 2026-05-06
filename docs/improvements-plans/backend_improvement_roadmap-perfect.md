# 🐱 Meowie Backend — Improvement Roadmap

## What You've Already Built Well

Before diving into improvements, let's acknowledge what's already solid — these are things you can **already** put on your resume:

| Area | What You Have | Resume Bullet? |
|------|-------------|:-:|
| **Auth** | OTP-based passwordless auth, rotating refresh tokens, bcrypt-hashed storage, token-mismatch invalidation | ✅ |
| **Background Jobs** | BullMQ queues for email + image processing, exponential backoff, retry logic | ✅ |
| **Caching** | Redis-backed caching, custom `@Cacheable` decorator, abstract `CacheService` (strategy pattern) | ✅ |
| **Rate Limiting** | Multi-tier throttling (short/medium/long) via Redis-backed store | ✅ |
| **CI/CD** | Full GitHub Actions pipeline → ECR → Docker → VPS with healthcheck loops | ✅ |
| **Database** | TypeORM + Postgres, schema-scoped, separate app/migrator roles, connection pooling | ✅ |
| **Observability** | Sentry integration (5xx auto-capture), structured logging with redaction, Swagger (non-prod) | ✅ |
| **Security** | Zod-validated env, CORS domain regex, JWT guards, DTO whitelisting | ✅ |
| **AI Integration** | Gemini-powered search query auto-correction | ✅ |
| **Data Sync** | Scheduled cron jobs scraping IMDB/Letterboxd → TMDB mapping → transactional DB sync | ✅ |
| **API Versioning** | URI-based versioning with default `v1` | ✅ |

> [!NOTE]
> You've covered a lot of ground. The suggestions below are about **deepening** existing patterns and filling the few remaining gaps that would make this project truly stand out.

---

## Areas for Improvement — Ranked by Resume Impact

### 1. 🧪 Automated Testing (HIGH IMPACT)

**Current state:** Zero test files exist. The `test/` directory has only a `jest-e2e.json` config. This is the single biggest gap.

**Why it matters:** Every backend engineering interview will ask about testing. Having `0 tests` undermines all the great architecture you've built.

**What to implement:**

#### A. Unit Tests for Business Logic
Target pure logic first — these are easy wins:
- `screeningStatus()` in MovieService (complex branching logic → perfect test candidate)
- `isMovieValid()`, `findCertification()`, `constructSortRelatedParams()`
- `isExpired()` in OtpService
- `redactSensitiveInfo()` utility
- `isUniqueConstraintViolation()` DB error helpers
- `formatDuration()`, `formatGenres()`, `formatCasts()` media utils

#### B. Integration Tests for Critical Flows
Test the service layer with mocked repositories:
- Auth flow: `verifyOtp → create user → generate tokens → rotating refresh`
- Library operations: `markAsSeen`, `markAsSaved` (including the upgrade/downgrade logic)
- Cache decorator behavior (cache hit/miss/stale scenarios)

#### C. E2E Tests for API Contracts
Test actual HTTP endpoints with `supertest`:
- Health check returns `200` with expected shape
- Auth endpoints return correct status codes (201 for new user, 200 for existing)
- Protected endpoints return `401` without token
- Rate limiting kicks in after threshold

**Resume bullet:** *"Implemented comprehensive test suite (unit, integration, E2E) achieving XX% coverage across auth flows, business logic, and API contracts"*

---

### 2. 📄 Cursor-Based Pagination (HIGH IMPACT)

**Current state:** All paginated endpoints use offset-based pagination (`skip`/`take` with page numbers).

**Why it matters:** Offset pagination degrades on large datasets (PostgreSQL must scan and discard `skip` rows). For the library (user-owned data that grows), this becomes a real problem. This is a common senior-level interview topic.

**What to implement:**
- Implement cursor-based pagination on `getLibraryItemsPosters` using `createdAt` + `id` as the cursor (both are monotonically increasing and unique together)
- Keep offset pagination for TMDB proxy endpoints (TMDB's API is offset-based anyway)
- Create a shared `CursorPaginationDto` and `CursorPaginatedResponse<T>` type

**Resume bullet:** *"Migrated user-facing endpoints from offset to cursor-based pagination for O(1) query performance on growing datasets"*

---

### 3. 🛡️ Graceful Shutdown (MEDIUM-HIGH IMPACT)

**Current state:** No shutdown handling. If the container is stopped during a request or while a BullMQ job is running, data corruption or lost jobs are possible.

**What to implement:**
```typescript
// In main.ts
app.enableShutdownHooks();
```
Plus:
- Listen for `SIGTERM`/`SIGINT`
- Drain BullMQ workers (stop accepting new jobs, finish current ones)
- Close the Redis connection cleanly
- Close the TypeORM data source
- Set a hard timeout (e.g., 10s) after which force-exit

This pairs well with your Docker `HEALTHCHECK` — Kubernetes and Docker Swarm both send `SIGTERM` before `SIGKILL`.

**Resume bullet:** *"Implemented graceful shutdown with ordered teardown of background workers, database, and cache connections for zero-downtime deployments"*

---

### 4. 📊 Request-Scoped Correlation IDs (MEDIUM IMPACT)

**Current state:** Your `LoggingInterceptor` logs requests and responses but there's no way to trace a single request across multiple log lines (especially when concurrent requests are interleaved).

**What to implement:**
- Generate a UUID for each incoming request (or accept `X-Request-Id` from the client)
- Store it via `AsyncLocalStorage` (Node's native context propagation)
- Inject it into every log line automatically
- Return it in the response headers so the mobile app can report it when filing bugs

**Resume bullet:** *"Implemented distributed request tracing via correlation IDs using AsyncLocalStorage for end-to-end debugging across API, background jobs, and client reports"*

---

### 5. 🔄 Cache Invalidation Strategy (MEDIUM IMPACT)

**Current state:** Your caching is TTL-based only. There's no way to invalidate cache entries when the underlying data changes. For example:
- When a user rates a movie, the cached `movie-info-{id}` still has stale rating data
- When a collection syncs, `collections-{parentId}` still serves stale results until TTL expires

**What to implement:**
- Add a `@CacheEvict` decorator (complement to your `@Cacheable`)
- Implement pattern-based cache deletion in `RedisService` using `SCAN` (not `KEYS`)
- Wire it up: when `collections-sync` completes → evict `collections-*`; when rating updates → evict `movie-info-{id}`

**Resume bullet:** *"Designed event-driven cache invalidation with pattern-based eviction, ensuring data consistency across cached endpoints while maintaining sub-millisecond read performance"*

---

### 6. 🗄️ Database Query Optimization (MEDIUM IMPACT)

**Current state:** `getLibraryItemsPosters` does N+1 queries — for each library item, it calls `getBasicMovieInfo` or `getBasicSeriesInfo` individually, plus `generateBlurhash`. With 20 items per page, that's potentially 40+ network calls.

**What to implement:**
- Batch TMDB lookups using `Promise.all` with concurrency limits (use a semaphore pattern or `p-limit`)
- Consider storing the minimal poster data (title, posterPath) denormalized in `LibraryItem` at write time, so the list query becomes a single DB call
- Add database indexes analysis — run `EXPLAIN ANALYZE` on your most common queries

**Resume bullet:** *"Eliminated N+1 query patterns and implemented denormalized read models, reducing library endpoint latency by XX%"*

---

### 7. 🔐 Role-Based Access Control (RBAC) (MEDIUM IMPACT)

**Current state:** Auth is binary — either you have a valid token or you don't. All authenticated users have the same permissions.

**What to implement:**
- Add a `role` column to the `User` entity (`user`, `admin`)
- Create a `@Roles()` decorator and `RolesGuard`
- Protect admin-only endpoints (e.g., managing collections, viewing user analytics)
- This also opens the door for a future admin dashboard

**Resume bullet:** *"Implemented role-based access control (RBAC) with custom decorators and guards for fine-grained authorization across API endpoints"*

---

### 8. 🏥 Health Check Enrichment (LOWER IMPACT, QUICK WIN)

**Current state:** Health endpoint returns `{ status: 'ok' }` — it doesn't actually verify that dependencies are alive.

**What to implement:**
- Check Redis connectivity (`PING`)
- Check PostgreSQL connectivity (lightweight query)
- Check BullMQ queue health (active/waiting/failed counts)
- Return structured response with per-dependency status
- Use NestJS's `@nestjs/terminus` module for standardized health checks

**Resume bullet:** *"Built deep health check system monitoring database, cache, and job queue liveness for proactive incident detection"*

---

### 9. 📈 API Response Compression (LOWER IMPACT, QUICK WIN)

**Current state:** No response compression. For endpoints returning large JSON payloads (movie lists with blurhash strings, poster URLs, etc.), this adds unnecessary bandwidth.

**What to implement:**
- Add `compression` middleware
- This is literally a 2-line change and can reduce response sizes by 60-80%

---

### 10. 🔁 Idempotency for Mutation Endpoints (LOWER IMPACT, ADVANCED)

**Current state:** If a client retries a `POST /library/mark-seen` due to network timeout, it could fail with "already marked as seen" instead of being safely replayed.

**What to implement:**
- Accept an `Idempotency-Key` header on mutation endpoints
- Store the response in Redis keyed by `{userId}:{idempotencyKey}`
- On duplicate requests, return the stored response instead of re-executing

**Resume bullet:** *"Implemented idempotent mutation endpoints with Redis-backed response caching, ensuring safe client retries across unreliable mobile networks"*

---

## Suggested Priority Order

Here's my recommended order, optimizing for **resume impact × implementation effort**:

| Priority | Feature | Effort | Impact |
|:--------:|---------|:------:|:------:|
| 1 | **Automated Testing** | Medium | 🔥🔥🔥 |
| 2 | **Graceful Shutdown** | Low | 🔥🔥 |
| 3 | **Health Check Enrichment** | Low | 🔥🔥 |
| 4 | **Cursor-Based Pagination** | Medium | 🔥🔥🔥 |
| 5 | **Correlation IDs** | Medium | 🔥🔥 |
| 6 | **Cache Invalidation** | Medium | 🔥🔥 |
| 7 | **N+1 Query Fixes** | Medium | 🔥🔥 |
| 8 | **RBAC** | Medium | 🔥🔥 |
| 9 | **Response Compression** | Trivial | 🔥 |
| 10 | **Idempotency Keys** | High | 🔥🔥 |

> [!TIP]
> Items 1-3 are the best "bang for buck" — they demonstrate engineering maturity and are relatively straightforward to implement. Testing alone would be the single most impactful addition.

---

## What NOT to Add (Common Over-Engineering Traps)

- ❌ **GraphQL** — Your API is well-structured REST; adding GraphQL for a mobile app with fixed screens adds complexity without benefit
- ❌ **Microservices** — Your modular monolith is the right architecture at this scale
- ❌ **Event sourcing / CQRS** — Overkill for this domain
- ❌ **WebSockets** — No real-time use case yet; don't add it just to add it
- ❌ **Kubernetes** — Your Docker + VPS setup is honest and appropriate; K8s would be resume-padding

---

## How to Talk About These on Your Resume

> **Meowie** — Full-stack media discovery platform (NestJS / PostgreSQL / Redis)
> - Designed passwordless OTP authentication with rotating JWT refresh tokens and bcrypt-hashed storage
> - Built async background processing pipeline (BullMQ) for image analysis and email delivery with exponential backoff
> - Implemented multi-tier rate limiting, Redis-backed caching with custom decorators, and cursor-based pagination
> - Achieved XX% test coverage with unit, integration, and E2E tests across auth, library, and API contract layers
> - Built CI/CD pipeline (GitHub Actions → ECR → Docker → VPS) with automated migrations, Sentry source maps, and health-gated deployments
> - Integrated AI-powered search refinement using Gemini and scheduled data sync from external platforms (IMDB, Letterboxd)

Let me know which items you want to tackle first, and we can start implementing!
