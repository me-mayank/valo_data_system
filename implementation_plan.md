# Implementation Plan: Data Valo System Website

**Built for agentic development in Google Antigravity IDE.**
Read `PRD.md` first. Requirement IDs (`FR-*`, `NFR-*`) refer to it.

**Version history**
- v1.1: database is MongoDB Atlas (Free cluster)
- v1.2: design direction is Utilitarian (PRD section 10)
- **v1.3: two separate apps, `frontend/` (Next.js) and `backend/` (Node.js modular monolith), both plain JavaScript. No TypeScript anywhere.**

---

## 0. How to work in Antigravity

> Antigravity's folder names and features change between releases. Confirm the current rules/workflows location in its docs. The structure below uses the `.agent/` convention.

**Recommended setup**
1. Create a workspace, put `PRD.md` and `IMPLEMENTATION_PLAN.md` in the repo root, and create the `frontend/` and `backend/` folders as the phases direct.
2. Add the rules file from section 2 to `.agent/rules/`.
3. Use **Planning mode** for each phase so the agent produces a task list and implementation plan **before** coding. Review and approve it. Use Fast mode only for small fixes.
4. Work **one phase at a time**, each in a fresh agent conversation: *"Read PRD.md, IMPLEMENTATION_PLAN.md, and .agent/rules. Execute Phase N only."*
5. Use the **browser agent** for frontend verification and **Vitest + Supertest** for backend verification. Ask for screenshots and test output as evidence.
6. Commit after every phase (`feat(phase-N): ...`).

**Parallelism (optional):** after Phase 4, one agent can build frontend phases (5, 6) while another builds backend phases (7 backend half). They touch different top-level folders and only meet at `docs/API.md`. The API contract is the handshake: the backend agent updates `docs/API.md` first; the frontend agent builds against it. Never let two agents edit the same folder at the same time.

**Human-only tasks:** creating the Atlas cluster, Cloudinary account (optional), Vercel and backend-host projects, domain, and secrets; supplying real content and the logo.

---

## 1. Tech Stack and Conventions

### 1.1 Stack

| Area | Frontend (`/frontend`) | Backend (`/backend`) |
|---|---|---|
| Language | **JavaScript** (ES modules). No TypeScript | **JavaScript** (ES modules, `"type": "module"`). No TypeScript |
| Runtime / framework | Next.js (latest stable), App Router, `src/` directory | Node.js (active LTS, set in `engines`) + **Express** |
| Styling | Tailwind CSS with CSS variables for design tokens | n/a |
| Data | `fetch` to the backend only. **No database, no Mongoose** | MongoDB Atlas Free cluster via **Mongoose** |
| Validation | `zod` + `react-hook-form` (UX-level checks only) | `zod` (authoritative) |
| Auth | Reads session by calling the backend. Holds no auth secret | `bcryptjs` (hashing) + `jose` (JWT in an `httpOnly` cookie) |
| Security | CSP and security headers in `next.config.mjs` | `helmet`, `cors` (frontend origin only), `cookie-parser`, custom Origin check |
| Logging | n/a | `pino` + `pino-http` |
| Images | `next/image` | `cloudinary` SDK (signed uploads, optional) |
| Email (Should) | n/a | Resend |
| UI primitives | Radix UI (Dialog, Accordion), restyled to the tokens | n/a |
| Icons | `lucide-react`, sparingly | n/a |
| Tests | Vitest (unit), Playwright (e2e) | Vitest + Supertest + `mongodb-memory-server` |
| Lint/format | ESLint + Prettier | ESLint + Prettier + `dependency-cruiser` (architecture check) |
| Hosting | Vercel | A Node host (for example Render). Confirm current free-tier terms before launch |

**Why Express:** "plain Node.js" in practice means a small, well-known framework on top of Node. Express keeps the backend minimal, JavaScript-only, and easy for agents to follow. Do not add NestJS, Fastify, or any other framework without approval.

**JavaScript conventions:** ES modules everywhere, `async/await`, no `.ts`/`.tsx` files, no `tsconfig.json`, no `typecheck` script. Use **JSDoc** comments on service and repository functions to document shapes. The frontend uses `jsconfig.json` for the `@/` import alias.

### 1.2 Repository layout

```
/
  PRD.md
  IMPLEMENTATION_PLAN.md
  README.md                    # how to run both apps
  .gitignore
  .agent/rules/data-valo.md    # agent rules (section 2)
  docs/
    API.md                     # THE contract between frontend and backend
    ADMIN_GUIDE.md
  frontend/                    # Next.js, JavaScript
    package.json  jsconfig.json  next.config.mjs  .env.example
    src/
      app/
        layout.js  not-found.js  sitemap.js  robots.js
        (public)/              # /, /courses, /courses/[slug], /colleges, /about, /contact, /privacy, /terms
        admin/
          login/page.js
          (protected)/         # layout calls requireAdminSession(); overview, courses, leads, campus-requests, settings
        internal/revalidate/route.js    # webhook called by the backend
      components/ui/  components/site/  components/admin/
      lib/api/server.js        # server-only fetch to BACKEND_URL (cache tags, cookie forwarding)
      lib/api/client.js        # browser fetch to relative /api/* (timeouts, "waking up" handling)
      lib/popup/               # pure popup state machine
      lib/validation/          # zod schemas (UX-level)
      lib/utils/
    tests/unit/  tests/e2e/
  backend/                     # Node.js + Express, JavaScript (ES modules)
    package.json  eslint.config.js  .dependency-cruiser.cjs  .env.example
    src/
      server.js                # bootstrap: connect DB, listen, graceful shutdown
      app.js                   # COMPOSITION ROOT: middleware, mounts routers, registers event listeners
      config/env.js            # zod-validated environment, fails fast
      shared/                  # infrastructure only, no business logic
        db/mongo.js
        http/                  # error-handler, async-handler, validate, reject-operator-keys, origin-check, health.routes.js
        errors/                # AppError, NotFoundError, ValidationError, UnauthorizedError, ...
        events/event-bus.js
        logger.js
        rate-limit/            # rate-limit.service.js + rate-limit-event.model.js (TTL)
        utils/                 # client-ip.js, hash-ip.js, csv.js, escape-regex.js, slugify.js, pagination.js
      modules/
        auth/  courses/  leads/  campus-requests/  settings/  uploads/  reports/  notifications/  revalidation/
    scripts/                   # ensure-indexes.js, seed-content.js, seed-admin.js, backup.js
    tests/                     # cross-module integration tests
```

### 1.3 Backend modular-monolith rules

**Module template** (every module follows this):
```
modules/<name>/
  index.js                # PUBLIC API: the ONLY file other modules and scripts may import
  <name>.routes.js        # Express router
  <name>.controller.js    # HTTP only: read req, call service, shape res
  <name>.service.js       # business logic; no req/res; no direct model access
  <name>.repository.js    # ALL database queries for this module's collections
  <name>.model.js         # Mongoose schema; private to the module
  <name>.validation.js    # zod schemas
  <name>.events.js        # (optional) event names and payload docs
  __tests__/              # unit + integration tests for the module
```

**Rules**
1. **Public API only.** A module imports another module only via `modules/<other>/index.js`. Never `modules/<other>/<anything else>`.
2. **Data ownership.** Each collection is owned by one module. No module imports another module's model or repository, or queries its collection. If you need its data, call its public function.
3. **Layering.** routes → controller → service → repository → model. Controllers never import repositories or models. Services never see `req`/`res`. Only repositories import models.
4. **Shared kernel.** `shared/` holds infrastructure only. It never imports from `modules/`, and it holds no business rules.
5. **Events for side effects.** Cross-module reactions use the in-process event bus (`shared/events/event-bus.js`). A module registers its listeners in a `registerListeners(bus)` function exported from `index.js`. Listener errors are caught and logged; they never break the emitter's request.
6. **Composition root.** Only `app.js` mounts routers and calls `registerListeners`. Modules do not mount themselves.
7. **Scripts obey the rules too.** Files in `scripts/` import modules only through `index.js`.
8. **Enforcement.** `npm run check:architecture` (dependency-cruiser) and ESLint `no-restricted-imports` fail on any violation. It must pass before a phase is done.

**Module map**

| Module | Owns | Public API (exported from `index.js`) | Emits | Listens to |
|---|---|---|---|---|
| `auth` | `admins` | `authRouter`, `requireAdmin`, `createAdmin()` | none | none |
| `courses` | `courses` | `publicCoursesRouter`, `adminCoursesRouter`, `getPublishedCourseIds(ids)`, `getCourseTitles(ids)`, `countCourses()`, `seedSampleCourses()` | `course.changed` | none |
| `leads` | `leads` | `publicLeadsRouter`, `adminLeadsRouter`, `getLeadStats()`, `getLatestLeads(n)` | `lead.created` | none |
| `campus-requests` | `campus_requests` | `publicCampusRouter`, `adminCampusRouter`, `getCampusRequestCount()` | `campus-request.created` | none |
| `settings` | `site_settings` | `publicSettingsRouter`, `adminSettingsRouter`, `getSettings()`, `ensureDefaultSettings()` | `settings.changed` | none |
| `uploads` | none (Cloudinary) | `uploadsRouter`, `signUpload()`, `deleteImage(publicId)` | none | none |
| `reports` | none | `reportsRouter` | none | none (calls `leads`, `courses`, `campus-requests` public APIs) |
| `notifications` | none | `registerListeners` | none | `lead.created`, `campus-request.created` |
| `revalidation` | none | `registerListeners` | none | `course.changed`, `settings.changed` |

`courses` calls `uploads.deleteImage()` when a course or its image is removed. `leads` calls `courses.getPublishedCourseIds()` to validate submitted course ids.

### 1.4 API contract (summary; full detail lives in `docs/API.md`)

Base path `/api`. JSON in, JSON out.
- Success: `{ "ok": true, "data": ... }`
- Error: `{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "..." } } }`
- Lists: `data = { items, page, pageSize, total }`
- Status codes: 200/201 success, 400 validation, 401 not signed in, 403 forbidden origin, 404 not found, 409 conflict (e.g. duplicate slug), 429 rate limited, 500 unexpected

| Area | Endpoint | Auth |
|---|---|---|
| Health | `GET /api/health` | none |
| Public courses | `GET /api/public/courses?category=`, `GET /api/public/courses/:slug` | none |
| Public settings | `GET /api/public/settings` | none |
| Student lead | `POST /api/public/leads` | none (rate limited) |
| Campus request | `POST /api/public/campus-requests` | none (rate limited) |
| Admin auth | `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me` | login: none |
| Admin courses | `GET /api/admin/courses`, `POST /api/admin/courses`, `GET/PUT/DELETE /api/admin/courses/:id`, `PATCH /api/admin/courses/:id/status`, `POST /api/admin/courses/reorder` | admin |
| Admin uploads | `POST /api/admin/uploads/sign` | admin |
| Admin leads | `GET /api/admin/leads`, `GET/DELETE /api/admin/leads/:id`, `GET /api/admin/leads/export` | admin |
| Admin campus | `GET /api/admin/campus-requests`, `GET/DELETE /api/admin/campus-requests/:id`, `GET /api/admin/campus-requests/export` | admin |
| Admin settings | `GET /api/admin/settings`, `PUT /api/admin/settings` | admin |
| Admin overview | `GET /api/admin/overview` | admin |

### 1.5 Communication between the apps

- **Browser → backend:** the browser calls `/api/*` on the frontend's domain. `next.config.mjs` rewrites `/api/:path*` to `${BACKEND_URL}/api/:path*`. Cookies set by the backend therefore behave as first-party cookies. (`BACKEND_URL` must be available at **build time**, since rewrites are evaluated during the build.)
- **Next.js server → backend:** server components call the backend directly through `lib/api/server.js`, using Next.js cache **tags** (`courses`, `settings`) so pages can be refreshed on demand. For admin pages the helper forwards the incoming `cookie` header.
- **Backend → frontend (cache refresh):** after a course or settings change, the `revalidation` module sends `POST ${FRONTEND_REVALIDATE_URL}` with header `x-revalidate-secret`. The frontend route `internal/revalidate` verifies the secret and refreshes the tags and paths (use the `revalidateTag` / `revalidatePath` API of the installed Next.js version). Failure is logged and never blocks the admin save; a short `revalidate` time (60s) on public fetches is the fallback.
- **Admin page protection:** `requireAdminSession()` (server-only) calls `GET /api/admin/auth/me` with the forwarded cookie and redirects to `/admin/login` on 401. The real enforcement is always the backend's `requireAdmin`.
- **Client IP:** the backend derives the client IP with `getClientIp(req)` using `TRUST_PROXY_HOPS`; it must be verified in QA that two different clients produce different IP hashes (see Phase 10).

### 1.6 Environment variables

**`backend/.env.example`**
```
NODE_ENV=development
PORT=4000
MONGODB_URI=                         # server only
MONGODB_DB=datavalo
AUTH_SECRET=                         # 32+ random bytes; signs admin session JWTs
IP_HASH_SECRET=                      # 32+ random characters
FRONTEND_ORIGIN=http://localhost:3000            # the ONLY allowed CORS/Origin
FRONTEND_REVALIDATE_URL=http://localhost:3000/internal/revalidate
REVALIDATE_SECRET=                   # same value as in the frontend
TRUST_PROXY_HOPS=1                   # number of proxies in front of the backend; verify in QA
CLOUDINARY_CLOUD_NAME=               # optional
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=                      # optional
LEAD_NOTIFY_EMAIL=                   # optional
```

**`frontend/.env.example`**
```
BACKEND_URL=http://localhost:4000    # used by server code and by rewrites at build time
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=                   # same value as in the backend
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # optional, public value
```

The frontend never receives `MONGODB_URI`, `AUTH_SECRET`, `IP_HASH_SECRET`, or Cloudinary secrets.

---

## 2. Agent Rules File

Save as `.agent/rules/data-valo.md`:

```markdown
# Data Valo System: Agent Rules

1. PRD.md is the source of truth. Do not add features that are not in it.
2. Execute only the phase you were asked to. Do not start the next one.
3. Before coding, write a short plan (files to create or change, risks). Wait for approval.
4. JavaScript (ES modules) ONLY, in both apps. No TypeScript: no .ts/.tsx files, no tsconfig.json, no typecheck script. Use JSDoc to describe shapes. Run `npm run lint` and the tests before reporting done.
5. Two apps, two folders. /frontend (Next.js) and /backend (Node.js + Express) each have their own package.json, node_modules, and .env.example. Never import code across the two folders. No shared package. They talk only over HTTP as described in docs/API.md.
6. Backend is a MODULAR MONOLITH. Follow section 1.3 of IMPLEMENTATION_PLAN.md exactly: module template, import other modules only through their index.js, one owner per collection, routes -> controller -> service -> repository -> model, shared/ has no business logic and never imports modules, cross-module side effects use the event bus, only app.js mounts routers. Run `npm run check:architecture` in /backend before reporting done.
7. The frontend has NO database access, NO Mongoose, and NO secrets except BACKEND_URL and REVALIDATE_SECRET. Browser code calls /api/* (rewritten to the backend). Server code uses lib/api/server.js.
8. Whenever an endpoint is added or changed, update docs/API.md in the same change.
9. Use design tokens only (CSS variables / Tailwind theme). Never hard-code hex values in components.
10. Colour rule: navy text on coral buttons. Never white or cream text on coral. Never coral text on cream. Coral is a signal colour only (primary action, active marker, status flag). Errors use the --error token.
11. Design direction is Utilitarian (PRD section 10). Zero border-radius, no shadows, no gradients, no decorative animation, no stock images or illustrations. Mono uppercase labels, visible 12-column grid with 1px rules, spec-sheet layouts, terse copy. Run `npm run check:design` in /frontend before reporting done.
12. Never use third-party trademarked logos (ServiceNow, Jira, Atlassian). Plain text names only.
13. Never store raw IP addresses. Hash with IP_HASH_SECRET for rate limiting only. Never use IP to decide popup visibility; use per-device storage.
14. Secrets: never commit .env files. Never prefix backend secrets with NEXT_PUBLIC_. Never print secrets in logs.
15. Backend security: validate every input with zod; accept typed values only; reject keys starting with $ or containing "."; never pass req.body or req.query into a Mongo filter; escape user text before $regex; every /api/admin/* route uses requireAdmin; Origin check on state-changing requests.
16. Accessibility: semantic HTML, labelled inputs, visible focus, keyboard support, 44px touch targets.
17. Keep pages short (1 to 2 screens). Do not add long scrolling sections.
18. When finished, produce a walkthrough artifact: what changed, how it was verified, screenshots/test output, open issues.
19. If something is ambiguous or blocked, stop and ask. Do not invent business content.
```

---

## 3. Phases

Each phase has: **Goal, Tasks, Acceptance criteria, Verification, Suggested prompt.**

| # | Phase | App |
|---|---|---|
| 0 | Prerequisites | human |
| 1 | Frontend scaffold and design system | frontend |
| 2 | Frontend layout and static pages | frontend |
| 3 | Backend foundation and module skeletons | backend |
| 4 | Backend: auth, courses, uploads, settings, revalidation | backend |
| 5 | Frontend: API layer, admin login, course management UI | frontend |
| 6 | Frontend: public courses from the API | frontend |
| 7 | Lead capture: backend modules and frontend forms | both |
| 8 | Popup engine | frontend |
| 9 | Admin leads, campus requests, settings, overview | both |
| 10 | QA, accessibility, security, performance | both |
| 11 | Deploy and handover | both |

---

### Phase 0: Prerequisites (human)

- [ ] Create a GitHub repo and open it in Antigravity; install Node.js active LTS locally
- [ ] Create a MongoDB Atlas account, organization, and project, then a **Free cluster** (region closest to your users)
- [ ] Atlas **Database Access:** a user with a long random password and the `readWrite` role on the `datavalo` database only (not Atlas admin)
- [ ] Atlas **Network Access:** add your current IP for development. For production the backend host's IPs are not fixed on free tiers, so production needs `0.0.0.0/0`; acceptable only with the strong password and least-privilege user above
- [ ] Put the connection string in `backend/.env` as `MONGODB_URI`
- [ ] Generate three secrets (e.g. `openssl rand -base64 48`): `AUTH_SECRET`, `IP_HASH_SECRET`, `REVALIDATE_SECRET`
- [ ] Create a Vercel account (frontend) and an account with a Node host such as Render (backend). Connect them later, in Phase 11
- [ ] (Optional for MVP) Cloudinary account, only if you want to upload course images; the default course tile is generated text
- [ ] Gather: logo (or approve a text wordmark), contact email/phone, 2 to 3 sample courses with syllabus, founder bio

---

### Phase 1: Frontend Scaffold and Design System

**Goal:** Running Next.js app (JavaScript) in `frontend/` with the Utilitarian design system (PRD section 10) and reusable UI components.

**Tasks**
1. Create `frontend/` with Next.js: **JavaScript** (not TypeScript), App Router, `src/` directory, Tailwind, ESLint, import alias `@/*`. Confirm there is no `tsconfig.json` and no `.ts` file.
2. Add scripts: `lint`, `test`, `test:e2e`, `check:design`, `build`.
3. Define tokens in `globals.css` and the Tailwind theme (PRD 10.1). **Set `borderRadius` to 0 and disable shadow utilities in the theme.**
4. Load **IBM Plex Mono** and **IBM Plex Sans** with `next/font` (PRD 10.2).
5. Build `components/ui` to the PRD 10.4 specs: Button (primary/secondary), Input/Textarea/Select/Checkbox with index labels and `ERROR:` messages, Tag `[LABEL]`, Accordion (indexed rows), Dialog (titled panel with `[X]`), Toast, Table.
6. Build layout primitives: `Grid` (12/8/4 columns with shared 1px borders), `SectionHeader` (`[01] LABEL` + rule), `SpecList` (key/value rows), `CourseCell`, `TypeTile` (generated typographic tile from course code and tool name).
7. Add `npm run check:design`: fails on `rounded-`, `shadow-`, `gradient`, `blur`, `animate-`, transitions longer than 100ms, or hard-coded hex values inside `src/components` and `src/app`.
8. Hidden dev route `/_design` showing every component in all states, with a toggle that overlays the column grid.
9. Write `frontend/.env.example` (section 1.6) and `frontend/README.md`.

**Acceptance criteria**
- No TypeScript files or config in `frontend/`
- Tokens match PRD exactly; no hex values inside components
- Primary button is coral with **navy** text; hover inverts to navy with cream text
- Visible keyboard focus on all interactive components
- Headings render in Plex Mono, body in Plex Sans, labels uppercase 12px
- `npm run lint`, `npm run check:design`, and `npm run build` pass

**Verification (browser agent):** open `/_design` at 375px and 1280px with the grid overlay on and off; screenshot; confirm fonts, palette, and square corners.

**Prompt**
> Read PRD.md (sections 6.4 and 10), IMPLEMENTATION_PLAN.md, and .agent/rules. Execute Phase 1 only, in `frontend/`. JavaScript only. Produce a plan first and wait for my approval.

---

### Phase 2: Frontend Layout and Static Pages

**Goal:** All public pages visually complete with placeholder content (courses hard-coded, forms UI only).

**Tasks**
1. Header (mono wordmark, nav as bordered cells with a 3px coral bar on the active page, *Register interest* button, `MENU` toggle on mobile) and the navy footer with labelled columns (PRD 10.3).
2. Pages: `/` (FR-PUB-01), `/about` (FR-PUB-04), `/colleges` (FR-PUB-05, form UI only), `/contact` (FR-PUB-06, form UI only), `/privacy`, `/terms` (FR-PUB-07). Course data may be hard-coded **only here**; Phase 6 replaces it.
3. **No decorative animation.** State changes are instant or 100ms at most; respect `prefers-reduced-motion`.
4. SEO: metadata per page, `sitemap.js`, `robots.js`, Open Graph defaults.
5. 404 page in the same style.

**Acceptance criteria**
- Every page fits about 2 screens at 1280×800
- Hero is a navy block with the right-hand spec panel; page background is cream
- Coral appears only as a signal (primary action, active nav bar, status flag)
- 12-column structure visible: cells share 1px borders, sections divided by rules
- No rounded corners, shadows, gradients, or stock imagery; `npm run check:design` passes
- Responsive 360px to 1440px, no horizontal scroll; Lighthouse (mobile) Accessibility at least 95

**Verification (browser agent):** visit every route at 375px and 1280px, screenshot each, test the mobile menu, check for horizontal overflow.

**Prompt**
> Execute Phase 2 only, in `frontend/`. Use the placeholder copy from PRD section 10.6. Do not call any backend and do not wire forms.

---

### Phase 3: Backend Foundation and Module Skeletons

**Goal:** A running Express service in `backend/` with the shared kernel, the modular-monolith skeleton, all models and indexes, seed scripts, and automated architecture enforcement. No business endpoints yet except health.

**Tasks**
1. Create `backend/`: `package.json` (`"type": "module"`, `engines`, scripts: `dev` (`node --watch src/server.js`), `start`, `lint`, `test`, `check:architecture`, `ensure-indexes`, `seed:content`, `seed:admin`, `backup`). Dependencies: `express`, `mongoose`, `zod`, `bcryptjs`, `jose`, `helmet`, `cors`, `cookie-parser`, `pino`, `pino-http`. Dev: `vitest`, `supertest`, `mongodb-memory-server`, `eslint`, `prettier`, `dependency-cruiser`. **No TypeScript, no Babel, no extra frameworks.**
2. `config/env.js`: validate all environment variables with zod at startup; on failure print which variables are missing/invalid (never their values) and exit.
3. Shared kernel in `shared/`: Mongo connection (cached, `maxPoolSize: 5`, `bufferCommands: false`), logger, `AppError` family, `asyncHandler`, `validate(schema, source)` middleware, `rejectOperatorKeys` (rejects any key starting with `$` or containing `.` in body/query/params), `originCheck` (state-changing methods must send an `Origin` or `Referer` matching `FRONTEND_ORIGIN`), error handler producing the standard error envelope, event bus, rate-limit service (with TTL model), and utils (`getClientIp`, `hashIp` (HMAC-SHA256 with `IP_HASH_SECRET`), `csv`, `escapeRegex`, `slugify`, `pagination`).
4. `app.js` (composition root) with this middleware order: trust proxy (`TRUST_PROXY_HOPS`) → `pino-http` → `helmet` → `cors` (only `FRONTEND_ORIGIN`, `credentials: true`) → `express.json({ limit: '100kb' })` → `cookie-parser` → `rejectOperatorKeys` → `originCheck` → health route → (module routers arrive in later phases) → 404 → error handler. `server.js` connects to the database, listens, and shuts down gracefully.
5. `GET /api/health`: pings the database, returns `{ ok: true, data: { status: "up" } }`, and never returns internal details.
6. Create all nine module folders from the template in section 1.3, each with `index.js`, model, repository, validation, and (where listed in section 1.3) an empty router. Implement the **models** below.
7. `.dependency-cruiser.cjs` and ESLint `no-restricted-imports` rules implementing section 1.3 rules 1 to 4 and 7. Add `npm run check:architecture`.
8. Scripts (import modules only through `index.js`): `ensure-indexes.js` (`syncIndexes()` on every model), `seed-content.js` (settings document and 3 labelled **sample** courses: 1 draft, 2 published), `seed-admin.js` (email and password from prompt or env, at least 12 characters, bcrypt cost 12, idempotent). Both seed scripts use public functions exported from module `index.js` files.
9. Create `docs/API.md` with the conventions from section 1.4 and the health endpoint.
10. Create `backend/.env.example` (section 1.6) and `backend/README.md`.

**Model sketches (Mongoose, JavaScript)**
```js
// modules/courses/courses.model.js
const CourseSchema = new Schema({
  title:            { type: String, required: true, trim: true, maxlength: 120 },
  slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  shortDescription: { type: String, required: true, maxlength: 160 },
  code:             { type: String, trim: true, uppercase: true, maxlength: 12 },   // optional, e.g. SN-101
  overview:         String,
  syllabus:         [{ title: String, topics: [String] }],
  category:         String,
  tools:            [String],
  level:            { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  mode:             { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
  duration:         String,
  audience:         String,
  fee:              Number,                                     // optional; hidden publicly when empty
  thumbnail:        { url: String, publicId: String },          // optional; UI falls back to a typographic tile
  status:           { type: String, enum: ['draft', 'published'], default: 'draft' },
  featured:         { type: Boolean, default: false },
  sortOrder:        { type: Number, default: 0 },
}, { timestamps: true });
CourseSchema.index({ status: 1, sortOrder: 1 });
CourseSchema.index({ status: 1, featured: 1 });

// modules/leads/leads.model.js
const LeadSchema = new Schema({
  fullName:   { type: String, required: true, trim: true, maxlength: 80 },
  phone:      { type: String, required: true },               // normalised to 10 digits
  email:      { type: String, required: true, lowercase: true, trim: true },
  college:    { type: String, required: true, trim: true, maxlength: 120 },
  courseYear: { type: String, required: true, trim: true, maxlength: 60 },
  interestedCourseIds: [{ type: Schema.Types.ObjectId }],     // ids only; no cross-module ref/populate
  consent:    { type: Boolean, required: true, validate: (v) => v === true },
  consentAt:  { type: Date, default: Date.now },
  city: String, preferredMode: String, skillLevel: String, heardFrom: String,
  source:     { type: String, maxlength: 40 },
  pagePath:   String,
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
  formVariant:{ type: String, enum: ['popup', 'contact'], default: 'popup' },
}, { timestamps: true });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ source: 1 });

// campus-requests: institution, contactPerson, designation, email, phone,
//   approxStudents, preferredFormat, message, consent (must be true), timestamps.
// settings: key ('main', unique), popupEnabled (true), popupDelaySeconds (8),
//   popupScrollPercent (40), popupReappearSeconds (120), popupMaxDismissals (5),
//   contactEmail, contactPhone, instagramUrl, linkedinUrl.
// auth: email (unique, lowercase), passwordHash, timestamps.

// shared/rate-limit/rate-limit-event.model.js
const RateLimitEventSchema = new Schema({
  ipHash: { type: String, required: true },
  route:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
RateLimitEventSchema.index({ ipHash: 1, route: 1, createdAt: -1 });
RateLimitEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // auto-purge after 24h
```
Note: `leads` stores course ids as plain ObjectIds with **no `ref`/`populate`**, so the module boundary stays intact. Titles are fetched through `courses.getCourseTitles(ids)`.

**Acceptance criteria**
- No TypeScript files or config in `backend/`
- `npm run dev` starts the service; `GET /api/health` returns 200 with the database reachable (run against Atlas only when the human has completed Phase 0)
- Startup fails fast with a clear message when an environment variable is missing, without printing values
- `npm run check:architecture` and `npm run lint` pass
- **Negative proof:** the agent temporarily adds a forbidden import (for example `leads` importing `courses/courses.repository.js`), shows `check:architecture` failing, then removes it
- Requests with `$`-prefixed or dotted keys are rejected with 400; a state-changing request with a foreign `Origin` is rejected with 403 (tested)
- Duplicate slug and invalid enum values are rejected by the models (tested with `mongodb-memory-server`)
- Seed scripts are idempotent; `docs/API.md` exists

**Verification:** Vitest + Supertest output, the architecture-check failure/success logs, and a listing of the final `backend/src` tree.

**Prompt**
> Execute Phase 3 only, in `backend/` (plus `docs/API.md`). JavaScript only, Express, modular monolith exactly as in section 1.3. Do not implement business endpoints yet. Tell me which steps I must do manually (running seed scripts against Atlas).

---

### Phase 4: Backend: Auth, Courses, Uploads, Settings, Revalidation

**Goal:** Complete admin and public API for authentication, courses, image upload signing, and settings, with frontend cache refresh.

**Tasks**
1. **`auth` module.** `POST /api/admin/auth/login`: validate, rate limit (5 attempts per 15 minutes per IP hash), look up the admin, compare with bcrypt (do a dummy compare when the email is unknown), return one generic message on failure, issue a JWT (`jose`, HS256, 8-hour expiry) in cookie `dv_admin` (`httpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`). `POST /api/admin/auth/logout` clears it. `GET /api/admin/auth/me` returns the admin's email. Export `requireAdmin` from `index.js`.
2. **`courses` module.**
   - Public: `GET /api/public/courses` (published only, ordered by `sortOrder`, optional `category`), `GET /api/public/courses/:slug` (404 for draft or missing).
   - Admin: list (with search, status filter, pagination), create, read, update, delete, `PATCH /:id/status`, `POST /reorder` (swap `sortOrder` using `bulkWrite`).
   - Slug auto-generated and editable; duplicate slug returns 409 (handle Mongo error code `11000`).
   - Emits `course.changed` after every write. On delete or image replacement, calls `uploads.deleteImage(publicId)`.
   - Public export `getPublishedCourseIds(ids)`, `getCourseTitles(ids)`, `countCourses()`.
3. **`uploads` module.** `POST /api/admin/uploads/sign` returns signed Cloudinary upload parameters restricted to JPG/PNG/WebP and 2 MB. If Cloudinary variables are missing, return a clear 501-style error and leave the rest of the app working. Export `signUpload()` and `deleteImage()`.
4. **`settings` module.** `GET /api/public/settings` (popup and contact fields only), `GET` and `PUT /api/admin/settings` (validated ranges, e.g. delay 0 to 120 seconds). Emits `settings.changed`.
5. **`revalidation` module.** Listens to `course.changed` and `settings.changed`, then `POST`s to `FRONTEND_REVALIDATE_URL` with `x-revalidate-secret` and the tags to refresh (`courses`, `settings`). Timeout 3s, one retry, errors logged only.
6. Mount every router in `app.js`. Update `docs/API.md` with each endpoint (request, response, errors).

**Acceptance criteria**
- **Route inventory test:** an automated test walks the Express router stack and asserts every route under `/api/admin/*` (except login) returns 401 without a session
- Wrong password and unknown email return the **same** message; the sixth failed login in 15 minutes returns 429
- A tampered or expired cookie is rejected
- Draft courses never appear in public endpoints (tested); duplicate slug returns 409
- Publishing a course triggers one revalidation call (tested with a mocked HTTP target); a failing frontend does not fail the admin request
- `check:architecture` passes; `courses` does not import `uploads` internals (only `uploads/index.js`)
- `docs/API.md` matches implemented endpoints

**Verification:** Vitest + Supertest suites per module, the route-inventory test output, and a manual `curl` transcript of login, create, publish, and public read.

**Prompt**
> Execute Phase 4 only, in `backend/` and `docs/API.md`. Respect module boundaries and run `npm run check:architecture`. Add the route-inventory auth test.

---

### Phase 5: Frontend: API Layer, Admin Login, Course Management UI

**Goal:** The frontend talks to the backend and the admin can manage courses.

**Tasks**
1. `next.config.mjs`: rewrite `/api/:path*` to `${BACKEND_URL}/api/:path*`; security headers and CSP (allow Cloudinary image/upload hosts only if configured).
2. `lib/api/server.js` (`import 'server-only'`): `apiGet(path, { tags, revalidate })`, forwards the incoming `cookie` header when asked, unwraps the response envelope, throws typed errors.
3. `lib/api/client.js`: relative `fetch('/api/...')` with `credentials: 'same-origin'`, JSON handling, error normalisation, 60-second timeout, and an `onSlow` callback that fires after 5 seconds (used to show `SERVER IS WAKING UP. PLEASE WAIT.`).
4. `app/internal/revalidate/route.js`: verifies `x-revalidate-secret` against `REVALIDATE_SECRET`, refreshes tags and paths, returns `{ ok: true }`. Returns 401 otherwise.
5. `/admin/login` page (generic error message, loading state) and logout.
6. Admin layout in `admin/(protected)/` using `requireAdminSession()`; sidebar (Overview, Courses, Leads, Campus Requests, Settings). Leads, Campus Requests, Settings, and Overview pages are placeholders until Phase 9.
7. `/admin/courses`: table with status badge, featured toggle, publish/unpublish, reorder controls, delete with confirm.
8. `/admin/courses/new` and `/[id]`: form for every FR-ADM-02 field, syllabus builder (add/remove/reorder modules and topics), tags input for tools, slug auto-generation, optional course code, optional thumbnail upload (get a signed request from `/api/admin/uploads/sign`, upload directly to Cloudinary, save `{ url, publicId }`).
9. Toasts for success/error using the `OK:` / `ERROR:` pattern.

**Acceptance criteria**
- Unauthenticated visit to any `/admin/*` page (except login) redirects to `/admin/login`
- Login and logout work; the cookie is `httpOnly` and not readable from JavaScript
- Admin can create, edit, publish, unpublish, reorder, and delete a course end to end against the real backend
- The frontend bundle and `package.json` contain no `mongoose`, no `MONGODB_URI`, and no `AUTH_SECRET` (automated grep)
- `npm run lint`, `npm run check:design`, and `npm run build` pass

**Verification (browser agent, backend running):** logged-out redirect; log in; create a course with 2 syllabus modules; publish; reorder; delete. Screenshot each step.

**Prompt**
> Execute Phase 5 only, in `frontend/`. Build against `docs/API.md`; if the contract is missing something, stop and tell me instead of changing the backend.

---

### Phase 6: Frontend: Public Courses From the API

**Goal:** Replace hard-coded course data with live data.

**Tasks**
1. `/courses`: fetch published courses via `lib/api/server.js` with tag `courses`; render spec-sheet `CourseCell`s; filter chips by category/tool (`?category=`); empty state.
2. `/courses/[slug]`: full detail with syllabus accordion, sticky spec panel, *Enquire* button (placeholder link to `/contact?course=<slug>` until Phase 8), `notFound()` for missing/unpublished.
3. Home featured courses block (max 3, `featured = true`).
4. Public fetches use `revalidate: 60` as a fallback plus on-demand refresh through `internal/revalidate`. Cached pages also keep backend and database load low.
5. JSON-LD `Course` schema on detail pages; dynamic metadata; `next/image` for uploaded thumbnails (configure the Cloudinary host in `next.config.mjs`).

**Acceptance criteria**
- A course published in admin appears on `/courses` within about 10 seconds (revalidation webhook)
- An unpublished course returns 404 at its slug
- Settings and contact details come from the API, not hard-coded values

**Verification (browser agent):** publish then unpublish a course in admin and confirm the public pages update.

**Prompt**
> Execute Phase 6 only, in `frontend/`.

---

### Phase 7: Lead Capture (Backend Modules and Frontend Forms)

**Goal:** Working student form and campus request form with spam protection. Do the backend half first and update `docs/API.md` before starting the frontend half.

**Backend tasks**
1. `leads` module: `POST /api/public/leads`, in this order:
   - validate with zod (typed primitives only; this blocks payloads such as `{"$gt": ""}` in place of an email)
   - honeypot filled: return a generic success and store nothing
   - rate limit: count `rate_limit_events` for this `ipHash` + route in the last hour; 10 or more returns 429; otherwise insert an event (`ipHash = HMAC-SHA256(ip, IP_HASH_SECRET)`; the raw IP is never stored)
   - normalise (lowercase email, 10-digit phone) and confirm submitted course ids are valid ObjectIds of **published** courses via `courses.getPublishedCourseIds()`
   - dedupe: `findOne({ $or: [{ email }, { phone }] })`; if found, update with `$addToSet` on `interestedCourseIds` and fill newly provided optional fields; otherwise create. Do not add unique indexes on email or phone (two people may share a phone)
   - emit `lead.created`; return `{ ok: true }`
2. `campus-requests` module: `POST /api/public/campus-requests` with the same protections; emits `campus-request.created`.
3. `notifications` module (Should): listens to both events and sends an email through Resend; failure is logged and never affects the response.
4. Update `docs/API.md`.

**Frontend tasks**
5. Zod schemas in `lib/validation` (UX-level mirror of the backend rules).
6. `<StudentLeadForm variant="popup|full" />` with react-hook-form, inline `ERROR:` messages, loading/success/error states, consent checkbox with privacy link, and the **waking-up** behaviour (message after 5s, wait up to 60s, keep typed data on failure).
7. `<CampusRequestForm />`; wire both forms into `/contact` and `/colleges`.
8. `SourceTracker` client component storing sanitised `?src=` (`[a-z0-9-]`, max 40) in storage; forms send `source`, `pagePath`, and `deviceType`.

**Acceptance criteria**
- Valid submission creates one document with `consent` and `consentAt`; unchecked consent is blocked
- Operator-injection payloads (e.g. `email: {"$ne": null}`) return 400
- Honeypot submission returns a generic success and stores nothing
- The 11th request in an hour from the same IP hash returns 429
- Duplicate phone or email updates the existing lead and merges interests
- `/?src=iit-bhu`, then navigation, then submission stores `source = iit-bhu`
- No raw IP anywhere in the database
- A request from a foreign `Origin` is rejected with 403
- `leads` imports `courses` only via `courses/index.js`; `check:architecture` passes

**Verification:** backend Vitest + Supertest tests for validation, injection, honeypot, rate limit, dedupe, and events; Playwright test for the end-to-end `?src=` flow; a Playwright test that delays the backend response by 6 seconds and expects the waking-up message.

**Prompt**
> Execute Phase 7 only. Do the backend half first and update docs/API.md, stop for my review of the contract, then do the frontend half.

---

### Phase 8: Popup Engine (Frontend)

**Goal:** Implement FR-POP-01 to FR-POP-08 exactly.

**Tasks**
1. Pure state module `lib/popup/state.js` with no DOM access: `shouldShow(state, now, settings, pathname)`, `onDismiss(state, now)`, `onSubmit(state)`, `mode(state, settings)` returning `'hidden' | 'modal' | 'tab'`.
2. Storage adapter for `localStorage` + cookie (`dv_submitted`, `dv_dismiss_count`, `dv_last_dismissed_at`) with an in-memory fallback.
3. `<PopupController />` client component in the root layout (lazy-loaded): timers, scroll listener, route-change listener. Settings are fetched on the server (`/api/public/settings`, tag `settings`, revalidated when admin saves) and passed in as props, so the popup never calls the backend on its own to decide visibility.
4. `<LeadDialog />`: modal on desktop, bottom sheet under 768px, focus trap, Esc to close, scroll lock, reduced-motion support. Styled per PRD 10.4: titled panel (`FORM DV-01 / REGISTER INTEREST`), `[X]` close, flat backdrop, no entrance animation beyond 100ms.
5. `<StickyRegisterTab />` for the fallback mode.
6. Global `openLeadForm({ courseId? })` used by the header button, course detail button, and sticky tab; replaces the Phase 6 placeholder link.
7. Mark `dv_submitted` after a successful submit from **any** student form and immediately remove the popup and tab.

**Acceptance criteria**
- Shows after 8s or 40% scroll (whichever first); after dismissal it reappears on the next navigation or after 120s
- After 5 dismissals it becomes the sticky tab; the modal never auto-opens again
- After a successful submit it never appears again on that device, including after reload and in a new tab
- Never on `/contact`, `/privacy`, `/terms`, `/admin/*`; respects `popupEnabled` and the timing values from admin settings
- No IP logic anywhere in the popup code

**Verification:** table-driven Vitest tests for the state machine (fresh visit, dismiss ×1..5, submitted, storage blocked, suppressed routes); Playwright scenarios (desktop and 375px mobile); browser-agent screenshots of modal, sheet, and tab.

**Prompt**
> Execute Phase 8 only, in `frontend/`. Write the unit tests for the state machine first, then implement.

---

### Phase 9: Admin Leads, Campus Requests, Settings, Overview

**Goal:** Complete the admin tooling. Backend half first, then update `docs/API.md`, then the frontend.

**Backend tasks**
1. `leads` admin endpoints: list (page size 25, search on name/email/phone/college with **escaped** `$regex` input, filters for college, source, course, date range, form variant, sort), get one (with course titles via `courses.getCourseTitles()`), delete, and `GET /export` (CSV of the current filter).
2. `campus-requests` admin list, get, delete, export.
3. CSV utility in `shared/utils/csv.js`: proper escaping, UTF-8 with BOM for Excel, and **formula-injection protection** (prefix cells starting with `=`, `+`, `-`, `@` with a single quote).
4. `reports` module: `GET /api/admin/overview` returns totals, last-7-days count, top 5 sources, top 5 courses, latest 10 leads, built **only** from `leads`, `courses`, and `campus-requests` public APIs.
5. (Should) QR link helper is frontend-only (FR-ADM-07).

**Frontend tasks**
6. `/admin/leads`: server-paginated table, search, filters, detail drawer, delete with confirm, *Export CSV* link (same-origin download through the rewrite).
7. `/admin/campus-requests`, `/admin/settings` (popup and contact settings form), `/admin` overview.
8. (Should) QR link generator: input a campus name, get `https://<domain>/?src=<slug>` with a copy button.

**Acceptance criteria**
- Filters and search combine correctly; the export matches the filtered view
- CSV opens correctly in Excel and cells starting with `=` are neutralised (tested)
- Changing popup values in settings changes the public site's popup behaviour on the next load
- Every new `/api/admin/*` route is covered by the route-inventory 401 test
- `reports` imports no other module's internals; `check:architecture` passes

**Verification:** seed 30 leads; Supertest for filters/export/CSV safety; Playwright for the admin screens and the settings-to-popup effect.

**Prompt**
> Execute Phase 9 only. Backend first, update docs/API.md, then frontend.

---

### Phase 10: QA, Accessibility, Security, Performance

**Goal:** Reach the PRD release criteria.

**Tasks**
1. Lighthouse (mobile) on `/`, `/courses`, `/courses/[slug]`, `/contact`; fix issues until the PRD section 4 targets are met.
2. Accessibility pass with axe (Playwright): zero critical/serious violations on public pages and the popup.
3. Keyboard-only test of the popup, menu, forms, and admin.
4. Colour contrast audit of every text/background pair; run `npm run check:design` and confirm no rounded corners, shadows, gradients, or decorative animation anywhere, including admin.
5. Security (backend): re-run the route-inventory test; send NoSQL-injection payloads (e.g. `{"$ne": null}`) to every public route; confirm helmet headers, CORS limited to `FRONTEND_ORIGIN`, Origin check, cookie flags, rate limits, and that no secret appears in logs.
6. Security (frontend): CSP and security headers; bundle grep for secrets; confirm no database packages.
7. **Client-IP check:** run the full chain (frontend rewrite → backend). Submit from two different networks/devices (or by setting different `X-Forwarded-For` in a test) and confirm different `ipHash` values and correct rate limiting. Adjust `TRUST_PROXY_HOPS` if needed.
8. **Cold-start check:** stop the backend, then start it 20 seconds after a form submit begins; the form must show the waking-up message and eventually succeed without losing data.
9. Cross-browser smoke test (Chromium, Firefox, WebKit via Playwright).
10. Architecture audit: run `npm run check:architecture`, list every cross-module call, and confirm each goes through an `index.js`. Confirm no `.ts`/`.tsx`/`tsconfig.json` exists in either app.
11. Loading, error boundary, and 404 states everywhere.

**Acceptance criteria:** every item of PRD section 13 is ticked, with evidence.

**Prompt**
> Execute Phase 10 only. Produce a QA report artifact with scores, fixes made, and anything still open.

---

### Phase 11: Deploy and Handover

**Tasks**
1. Human: deploy the **backend** to the Node host (build `npm ci`, start `npm start`, health check path `/api/health`), set all `backend/.env.example` variables, and set `FRONTEND_ORIGIN` to the frontend's production URL. Atlas Network Access as in Phase 0.
2. Human: deploy the **frontend** to Vercel with `BACKEND_URL` set to the backend's production URL (needed at build time), `NEXT_PUBLIC_SITE_URL`, and `REVALIDATE_SECRET`. Then set the backend's `FRONTEND_REVALIDATE_URL` to `https://<frontend>/internal/revalidate`.
3. Human: against the production database run `npm run ensure-indexes`, `npm run seed:admin`, and (optional) `npm run seed:content`. Confirm there is no sign-up route.
4. Human: add an uptime monitor (for example UptimeRobot or cron-job.org) that calls `GET /api/health` every 10 minutes. This keeps the free backend awake and keeps Atlas from auto-pausing.
5. Agent: `scripts/backup.js` (exports each collection to JSON, using each module's public API) and a documented monthly backup routine, since the Free cluster has no automated backups.
6. Agent: write `README.md` (run both apps, scripts, deployment, backup/restore) and `docs/ADMIN_GUIDE.md` with screenshots: add a course, publish, reorder, view and export leads, change popup settings, create QR links.
7. Smoke test on production: forms submit, popup behaves, admin works, revalidation works (publish a course and see it live), sitemap reachable, health check returns 200.
8. Submit the sitemap to Google Search Console.

**Prompt**
> Execute Phase 11 agent tasks only (5 and 6, plus writing the smoke-test checklist). List the manual steps I need to perform on Vercel, the backend host, Atlas, and the uptime monitor.

---

## 3b. Operating Notes: Atlas Free Cluster and Free Backend Hosting

Limits below come from current provider documentation. Re-check them before launch because free tiers change.

| Topic | What to know | What we do about it |
|---|---|---|
| Atlas storage | 0.5 GB including indexes. A lead document is roughly 1 KB | Keep images on Cloudinary, never in MongoDB |
| Atlas throughput | About 100 read/write operations per second | Cached public pages (tags + 60s fallback), indexed queries, paginated admin tables |
| Atlas connections | Up to 500 | One cached connection per backend instance, small pool |
| Atlas auto-pause | Free clusters pause after a period with no connections (docs currently say 30 days) | The uptime monitor's `GET /api/health` pings the database every 10 minutes |
| Atlas backups | None on the Free tier | Monthly `scripts/backup.js` plus admin CSV exports; keep copies outside Atlas |
| Atlas network | Backend host IPs are not fixed on free tiers, so the allow-list must be open (`0.0.0.0/0`) | Strong random password, `readWrite`-only user on one database, TLS, DB reachable only from the backend |
| Backend sleeping | Free web services on many hosts sleep after idle time; the first request afterwards can take tens of seconds | Uptime monitor, 5-second "waking up" message, 60-second wait, no data loss |
| Backend hours | Free tiers usually cap monthly instance hours; confirm the current terms of the chosen host | Run one backend instance only |
| Upgrade path | If the site outgrows free tiers | Move the backend to a paid instance and Atlas to a paid tier by changing environment variables only |

---

## 4. End-to-End Test Scenarios (Playwright / browser agent)

| # | Scenario | Expected |
|---|---|---|
| 1 | Fresh visitor on `/` | Popup appears at about 8s |
| 2 | Visitor scrolls 40% before 8s | Popup appears at 40% |
| 3 | Close, then navigate to `/courses` | Popup appears again |
| 4 | Close, wait 120s on the same page | Popup reappears |
| 5 | Dismiss 5 times | Sticky tab only; no auto modal |
| 6 | Submit a valid form | Success message; popup and tab disappear; `dv_submitted` set |
| 7 | Reload and open a new tab after submit | No popup |
| 8 | Visit `/contact` fresh | No popup; full form visible |
| 9 | Land on `/?src=test-college`, browse, submit | Lead has `source = test-college` |
| 10 | Submit with honeypot filled | No document created |
| 11 | 11 submissions in an hour from one IP hash | The 11th returns 429 |
| 12 | Same phone submitted twice | One lead, interests merged |
| 13 | `popupEnabled = false` in settings | Popup never shows |
| 14 | Unpublish a course | Disappears from the public site; detail URL returns 404 |
| 15 | Anonymous request to `/admin/leads` | Redirect to login |
| 16 | Mobile 375px | Bottom sheet, no horizontal scroll |
| 17 | Backend delayed 6s during submit | Waking-up message, then success, no data loss |
| 18 | POST to the backend with a foreign `Origin` | 403 |
| 19 | Anonymous `GET /api/admin/leads` straight to the backend | 401 |
| 20 | Temporary forbidden cross-module import | `check:architecture` fails |

## 5. Definition of Done (per phase)

- [ ] Acceptance criteria met and verified with evidence (tests and/or screenshots)
- [ ] Frontend phases: `lint`, `check:design`, tests, and `build` pass
- [ ] Backend phases: `lint`, `check:architecture`, tests pass, and `docs/API.md` is up to date
- [ ] JavaScript only: no TypeScript files or config in either app
- [ ] No cross-folder imports between `frontend/` and `backend/`
- [ ] No hard-coded colours, no raw IP storage, no secrets in the repo
- [ ] Walkthrough artifact produced; open issues listed
- [ ] Changes committed with a clear message

## 6. Suggested Timeline (solo developer + agents)

| Phase | Estimate |
|---|---|
| 0. Prerequisites | 0.5 day |
| 1. Frontend scaffold and design system | 1 day |
| 2. Frontend static pages | 1.5 days |
| 3. Backend foundation and module skeletons | 2 days |
| 4. Backend auth, courses, uploads, settings, revalidation | 3 days |
| 5. Frontend API layer, admin login, course UI | 2 days |
| 6. Frontend public courses | 1 day |
| 7. Lead capture (both apps) | 2 days |
| 8. Popup engine | 1.5 days |
| 9. Admin leads, campus requests, settings, overview | 2 days |
| 10. QA and hardening | 1.5 days |
| 11. Deploy and handover | 1 day |
| **Total** | **about 19 days** |

## 7. Content Needed From the Client (blockers for launch)

- Logo or approval of a text wordmark
- Contact email, phone, and social links
- Final course list with duration, mode, tools, syllabus, and audience
- Founder/trainer names, short bios, and photos
- Decision on showing fees publicly
- Domain name
- Email address for lead notifications