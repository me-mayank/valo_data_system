# Data Valo System — Backend Modular Monolith

Node.js + Express backend service for **Data Valo System**.

Built strictly from `PRD.md` and `IMPLEMENTATION_PLAN.md`.

## Architecture: Modular Monolith

The backend is an independently deployable service divided internally into self-contained modules.
Each module owns its routes, controller, service, repository, and Mongoose schema/model.

```
src/
  app.js                   # Composition root: middleware pipeline, mounts routers, event listeners
  server.js                # Bootstrap: connects MongoDB, listens, graceful shutdown
  config/env.js            # Fails fast on invalid environment variables
  shared/                  # Infrastructure only (no business logic, never imports modules)
    db/mongo.js            # Cached connection, maxPoolSize: 5, bufferCommands: false
    errors/                # AppError hierarchy
    events/event-bus.js    # In-process asynchronous event bus
    http/                  # Error envelope, validate, rejectOperatorKeys, originCheck, health
    rate-limit/            # Sliding window rate limiter with 24h TTL collection
    utils/                 # client-ip, hash-ip (HMAC-SHA256), csv, slugify, pagination
  modules/
    auth/                  # Owns 'admins' collection
    courses/               # Owns 'courses' collection
    leads/                 # Owns 'leads' collection
    campus-requests/       # Owns 'campus_requests' collection
    settings/              # Owns 'site_settings' collection
    uploads/               # Cloudinary upload signing (no collection)
    reports/               # Read-only overview aggregations across module public APIs
    notifications/         # Event bus listeners for email dispatches
    revalidation/          # Frontend cache invalidation webhook dispatcher
```

### Modular Monolith Rules (Enforced by `dependency-cruiser`)

1. **Public API only**: Modules may only be imported via their `index.js`.
2. **Data ownership**: Each collection is owned by exactly one module. Direct cross-module model or repository imports are prohibited.
3. **Layered flow**: `routes` → `controller` → `service` → `repository` → `model`.
4. **Shared purity**: `src/shared/` must never import from `src/modules/`.
5. **Cross-module events**: Side effects (e.g. notifications) use the in-process event bus.
6. **No TypeScript**: Pure JavaScript (ES modules) only.

## Scripts

```bash
# Run local dev server with auto-restart
npm run dev

# Run ESLint
npm run lint

# Run architecture boundary check (dependency-cruiser)
npm run check:architecture

# Run integration tests (Vitest + Supertest + mongodb-memory-server)
npm test

# Synchronize model indexes on MongoDB
npm run ensure-indexes

# Seed initial site settings and 3 sample courses (1 draft, 2 published)
npm run seed:content

# Seed admin account (idempotent, bcrypt cost 12)
npm run seed:admin admin@datavalo.com <password-min-12-chars>
```

## Security & Privacy Rules

- **No Raw IP Storage**: IP addresses are hashed using HMAC-SHA256 with `IP_HASH_SECRET`. Raw IPs are never stored in any MongoDB document.
- **NoSQL Injection Defense**: `rejectOperatorKeys` rejects any incoming request containing keys starting with `$` or containing `.`.
- **CSRF / Origin Check**: State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require Origin matching `FRONTEND_ORIGIN`.
- **Standard Envelope**: All endpoints return standard `{ ok: true, data: ... }` or `{ ok: false, error: { code, message, fields } }`.

