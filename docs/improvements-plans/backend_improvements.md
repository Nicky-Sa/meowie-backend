# Meowie Backend — Improvement Recommendations

Based on a full audit of the codebase. Organized by effort and impact.

---

## 🐛 Bugs & Immediate Fixes

### 1. Duplicate module imports in AppModule
[app.module.ts](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/app.module.ts#L83-L86) imports `ConstantsModule` and `PersonModule` **twice each**:
```typescript
ConstantsModule,   // line 83
PersonModule,      // line 84
ConstantsModule,   // line 85 — duplicate
PersonModule,      // line 86 — duplicate
```
NestJS won't error, but it signals sloppiness. Remove the duplicates.

### 2. CORS is wide open
[main.ts:51](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/main.ts#L51-L55) has `origin: '*'` in production. Since this is a mobile app backend with JWT auth, restrict it to known origins or remove CORS entirely (mobile apps don't need it — CORS is a browser-only mechanism).

```diff
- origin: '*',
+ origin: env.get('BUILD_ENV') === 'production'
+   ? [] // Mobile apps don't send Origin headers; block browser requests
+   : '*',
```

### 3. Global filter ordering
[main.ts:20-21](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/main.ts#L20-L21) — `SentryGlobalFilter` is registered before `GlobalExceptionFilter`. NestJS applies filters in **reverse registration order**, so `GlobalExceptionFilter` runs first, catches everything, and sends the response — **Sentry never sees the exception**. Swap the order:

```diff
- app.useGlobalFilters(new SentryGlobalFilter());
- app.useGlobalFilters(new GlobalExceptionFilter());
+ app.useGlobalFilters(new GlobalExceptionFilter(), new SentryGlobalFilter());
```
> [!IMPORTANT]
> With this single-call syntax, NestJS evaluates left-to-right as a filter chain. `GlobalExceptionFilter` handles formatting, and `SentryGlobalFilter` captures upstream. Verify this matches Sentry's NestJS SDK docs — some versions expect to be the outermost filter.

---

## ⚡ Quick Wins (High Impact, Low Effort)

### 4. Health check endpoint
The Dockerfile has a healthcheck hitting `http://localhost:$PORT`, but [app.controller.ts](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/app.controller.ts) likely just returns a basic response. Add a proper `/health` endpoint that checks Redis + DB connectivity. This demonstrates operational maturity:

```typescript
@Get('health')
@SkipThrottle()
async healthCheck() {
  const [dbOk, redisOk] = await Promise.allSettled([
    this.dataSource.query('SELECT 1'),
    this.cacheService.get('health-ping'),
  ]);
  const healthy = dbOk.status === 'fulfilled' && redisOk.status === 'fulfilled';
  if (!healthy) throw new ServiceUnavailableException();
  return { status: 'ok' };
}
```

### 5. Graceful shutdown
The app doesn't handle `SIGTERM`/`SIGINT`. When Docker stops the container, in-flight BullMQ jobs and DB connections may be interrupted. Add:
```typescript
app.enableShutdownHooks();
```
This lets NestJS lifecycle hooks (`OnModuleDestroy`) run cleanly — your `RedisService` already has `onModuleDestroy`, so this just ensures it's actually called.

### 6. `Cache-Control` on endpoints with pending defaults
The movie/series info endpoints have `Cache-Control: public, max-age=3600`. When a response contains default blurhashes (not yet processed), the **browser** caches it for 1 hour even though the server-side `@Cacheable` correctly skips caching. Consider removing `Cache-Control` from info endpoints, or making it conditional:
```typescript
// In the controller, set Cache-Control only when the data is "complete"
```

### 7. Sentry DSN should be an env variable
[instrument.ts:7](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/instrument.ts#L7) hardcodes the Sentry DSN. Move it to env config — if you ever rotate DSNs or use different projects per environment, you'll need this.

---

## 🏗️ Medium Effort (Strong Senior Signals)

### 8. Testing
The `test/` directory only has a default `jest-e2e.json` with no actual tests. This is the **single biggest gap** for showcasing seniority. Add:

| Test type | What to test | Why it signals seniority |
|---|---|---|
| **Unit tests** | `@Cacheable` decorator with `skipCacheOnDefaults`, `containsPendingDefaults` utility, `screeningStatus` logic, rating formatters | Shows you test non-trivial business logic |
| **Integration tests** | Auth flow (OTP → verify → refresh → logout), Library CRUD | Shows you can test across modules |
| **E2E tests** | A few critical API flows with `supertest` | Shows you care about the contract |

> [!TIP]
> Start with the `@Cacheable` decorator — it has complex conditional logic (skip on defaults, evict stale cache) that's perfect for unit tests and easy to mock.

### 9. Structured logging
The `LoggingInterceptor` logs objects, but in production these become `[Object object]` unless the transport handles it. Use a structured logger like `pino` with `nestjs-pino` for JSON logs:
- Machine-parseable in production (CloudWatch, Datadog, etc.)
- Human-readable in development
- Automatic request ID correlation

### 10. Request-scoped correlation IDs
Add a middleware that generates a unique `X-Request-Id` for each request and threads it through all logs. This makes debugging production issues dramatically easier. Pairs well with structured logging (#9).

### 11. Rate limiting on auth endpoints could be tighter
`request-otp` allows 3 per minute, which is good. But `verify-otp` allows 5 per minute — a brute-force attacker could try 5 OTPs/min × 60 min = 300 guesses before the 5-minute expiry. Since the OTP is 6 digits (1M combinations), this isn't critical, but tightening to 3/min with a lockout after N failures would look strong.

### 12. TMDB service error handling & circuit breaker
[tmdb.service.ts](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/tmdb/tmdb.service.ts) — the private `get()` method has no error handling. If TMDB is down, every request will hang for the axios timeout then fail. Consider:
- **Timeout**: Set an explicit axios timeout (e.g., 5s)
- **Circuit breaker**: After N consecutive failures, stop calling TMDB for a cooldown period. This prevents cascading failures. Libraries like `cockatiel` or `opossum` work well.

### 13. API versioning
No API versioning currently. Adding `/v1/` prefix now (even if you don't need v2 yet) shows foresight:
```typescript
app.setGlobalPrefix('v1');
```

---

## 🎯 Architectural (High Effort, Maximum Senior Signal)

### 14. Docker image: multi-stage build
The current [Dockerfile](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/Dockerfile) copies a pre-built `dist/` from the CI runner. While functional, a multi-stage Dockerfile is more self-contained and portable:
```dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
HEALTHCHECK ...
CMD ["node", "dist/src/main"]
```

### 15. Database connection pool size
[database.config.ts](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/database/database.config.ts#L45) has `max: 2` connections. This is very low — under load, requests will queue waiting for a connection. For the app role, 10-20 is typical for a single instance. Calculate based on your DB plan's connection limit.

### 16. Redis connection reuse
The app creates **3 separate Redis connections**:
1. `RedisService` (cache) — via `new Redis()`
2. `ThrottlerStorageRedisService` — via `new Redis()` in [app.module.ts:67](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/src/app.module.ts#L67)
3. `BullModule` — via connection config

Consider creating a shared `Redis` instance or connection pool and injecting it across all three consumers. This reduces connection overhead and simplifies config.

### 17. Zero-downtime deployments
The [deploy script](file:///Users/nicky/Nicky/learning/meowie/meowie-backend/.github/workflows/deploy-release.yml#L183-L193) does `docker stop → docker rm → docker run`. There's a brief window where the app is completely down. For a portfolio piece, consider:
- **Blue-green**: Run the new container first, healthcheck it, then switch traffic
- **Docker Compose** with rolling updates
- Or at minimum: start the new container, wait for healthy, then stop the old one

### 18. OpenAPI/Swagger annotations
You have Swagger set up but the controllers don't have `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators. Fully annotating your API shows that you treat documentation as a first-class citizen. This is especially impactful for a portfolio project.

---

## 📋 Summary Priority Matrix

| Priority | Item | Effort | Impact |
|---|---|---|---|
| 🔴 **Do first** | #1 Duplicate imports | 1 min | Fixes bug |
| 🔴 **Do first** | #3 Filter ordering (Sentry) | 5 min | Sentry actually works |
| 🔴 **Do first** | #5 Graceful shutdown | 1 line | Prevents data corruption |
| 🟠 **High value** | #8 Tests (start with Cacheable) | 2-4 hrs | Biggest seniority signal |
| 🟠 **High value** | #4 Health endpoint | 30 min | Operational maturity |
| 🟠 **High value** | #18 Swagger annotations | 1-2 hrs | API documentation quality |
| 🟡 **Medium** | #12 TMDB timeout + circuit breaker | 1-2 hrs | Resilience |
| 🟡 **Medium** | #6 Cache-Control conditionals | 30 min | Completes the cache strategy |
| 🟡 **Medium** | #16 Redis connection reuse | 1 hr | Resource efficiency |
| 🟢 **Nice to have** | #9 Structured logging | 1-2 hrs | Production readiness |
| 🟢 **Nice to have** | #14 Multi-stage Docker | 30 min | DevOps maturity |
| 🟢 **Nice to have** | #17 Zero-downtime deploy | 2-3 hrs | Infrastructure polish |

Let me know which ones you'd like to tackle!
