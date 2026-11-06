# PRD: Data Valo System Website

| | |
|---|---|
| **Product** | Marketing website + lead-capture system for Data Valo System |
| **Version** | 1.3 (MVP). Architecture: separate **Next.js frontend** and **Node.js modular-monolith backend**, both plain **JavaScript**. Database: **MongoDB Atlas (Free cluster)**. Design: **Utilitarian** |
| **Status** | Ready for agentic development |
| **Companion file** | `IMPLEMENTATION_PLAN.md` |

> **How agents should use this file:** This is the source of truth for *what* to build. Requirement IDs (e.g. `FR-POP-03`) are referenced by the implementation plan. If this file and a prompt conflict, ask for clarification instead of guessing. Never add features that are not listed here.

---

## 1. Overview

**Data Valo System** is a newly registered company that trains college students on the internal tools and techniques used in the software industry (ServiceNow, Jira, and similar enterprise tools). The company is in its **client-gathering phase** and will advertise on college campuses through posters, QR codes, and talks.

This website is the company's public face. It must (1) look credible and memorable, (2) show what the company teaches, (3) collect student leads, and (4) let non-technical staff manage courses without touching code.

## 2. Goals and Non-Goals

### Goals
1. Present Data Valo System as a professional, trustworthy training company.
2. Show the course catalogue, **managed entirely from an admin panel**.
3. Capture student leads through a short popup form that keeps appearing on a device **until the form is submitted from that device**.
4. Capture college/TPO enquiries (campus visit and workshop requests).
5. Tell the team which campus drive generates the most leads (QR source tracking).
6. Work well on mobile, since most students will arrive by scanning a QR code on a phone.

### Non-Goals (MVP)
- Student login, dashboards, or accounts
- Online payments or enrolment checkout
- Video hosting, LMS, or course delivery
- Blog or CMS beyond courses
- Multi-language support
- Multiple admin roles (one admin role only)

## 3. Users

| Persona | Description | Primary need |
|---|---|---|
| **Student (Aarav)** | 2nd to 4th year college student, on a phone, scanned a poster QR | Quickly see what is taught and register interest |
| **TPO / Faculty (Ms. Rao)** | Training and placement officer evaluating a vendor | Trust signals, workshop formats, a way to request a visit |
| **Admin (company staff)** | Non-technical team member | Add/edit courses, view and export leads |

## 4. Success Metrics

| Metric | Target (first 60 days) |
|---|---|
| Popup-to-submission conversion | at least 8% of unique devices shown the popup |
| Lead data completeness (required fields valid) | 100% (enforced by validation) |
| Mobile Lighthouse Performance | at least 90 |
| Lighthouse Accessibility / SEO / Best Practices | at least 95 each |
| Time for admin to publish a new course | under 3 minutes |
| Campus attribution (leads with a `src` value) | at least 60% of leads |

## 5. Scope

### Must have (MVP)
Public pages, course catalogue with admin CRUD, student lead form (popup and full), popup persistence logic, campus request form, admin auth, leads table with CSV export, popup settings, responsive design, SEO basics, privacy page and consent.

### Should have
Email notification on a new lead, source/QR link generator in admin, basic analytics.

### Could have (post-MVP)
Testimonials manager, WhatsApp click-to-chat, course brochure PDF upload, lead status tracking (new / contacted / enrolled).

---

## 6. Information Architecture

### 6.1 Public routes

| Route | Page | Target length |
|---|---|---|
| `/` | Home | ~2 screens |
| `/courses` | Course catalogue | 1 to 2 screens |
| `/courses/[slug]` | Course detail | 1 to 2 screens |
| `/colleges` | For Colleges | ~2 screens |
| `/about` | About | ~1.5 screens |
| `/contact` | Contact / Register | ~1.5 screens |
| `/privacy` | Privacy policy | text page |
| `/terms` | Terms | text page |

**Principle:** shallow scroll depth. Each page does one job. Prefer more pages over long pages.

### 6.2 Admin routes (protected)

| Route | Purpose |
|---|---|
| `/admin/login` | Sign in |
| `/admin` | Overview (lead counts, latest leads) |
| `/admin/courses` | Course list |
| `/admin/courses/new` and `/admin/courses/[id]` | Create / edit course |
| `/admin/leads` | Leads table, filters, CSV export |
| `/admin/campus-requests` | College enquiries |
| `/admin/settings` | Popup and contact settings |

### 6.3 Navigation
Header: **Home · Courses · For Colleges · About · Contact** plus a coral **Register Interest** button (opens popup form). Footer: quick links, contact details, Privacy, Terms. Admin links never appear in public navigation.

### 6.4 System architecture and technology constraints

**Two separate applications in one repository, deployed independently:**

| | `frontend/` | `backend/` |
|---|---|---|
| Technology | **Next.js** (App Router) | **Node.js** with Express |
| Language | **JavaScript only** (no TypeScript) | **JavaScript only** (ES modules, no TypeScript) |
| Responsibility | Rendering, SEO, public pages, forms UI, popup, admin UI | REST API, validation, authentication, business logic, database access, upload signing, email, CSV export |
| Must not contain | Database access, database credentials, business rules, auth secrets | Any UI rendering |
| Package/dependencies | Own `package.json`, own `.env` | Own `package.json`, own `.env` |

- The two apps **never import each other's code**. There is no shared code package. They talk only over HTTP using the contract in `docs/API.md` (JSON over HTTPS).
- **Browser to API:** the browser calls `/api/*` on the frontend's own domain; Next.js forwards those calls to the backend (a rewrite). This keeps the admin session cookie first-party and avoids cross-site cookie problems. Next.js server code calls the backend directly.
- **Validation:** the backend is authoritative. The frontend repeats basic checks only for user experience.

**Backend architecture: modular monolith.** One deployable Node.js service, internally divided into self-contained **modules**, each owning its own routes, controller, service, repository, and database model.

| Module | Owns | Purpose |
|---|---|---|
| `auth` | `admins` | Admin login, logout, session check, `requireAdmin` guard |
| `courses` | `courses` | Course CRUD, publish, reorder, public course reads |
| `leads` | `leads` | Student lead capture, dedupe, admin list, search, export |
| `campus-requests` | `campus_requests` | College enquiries, admin list, export |
| `settings` | `site_settings` | Popup and contact settings |
| `uploads` | (Cloudinary, no collection) | Signed image upload parameters, image deletion |
| `reports` | (none, read-only) | Admin overview statistics, built from other modules' public APIs |
| `notifications` | (none) | Optional email on new lead or campus request |
| `revalidation` | (none) | Tells the frontend to refresh cached pages when courses or settings change |

**Module rules (enforced by an automated check, see `IMPLEMENTATION_PLAN.md`):**
1. A module may use another module **only through that module's `index.js`** (its public API).
2. Every collection is owned by exactly one module. No module reads or writes another module's collection or imports its model or repository.
3. Inside a module the flow is routes, then controller, then service, then repository, then model. Controllers do not touch the database; services do not touch `req` or `res`; only repositories use models.
4. Shared infrastructure (config, database connection, error handling, event bus, logging, rate limiting, utilities) lives in `shared/` and contains **no business logic** and never imports a module.
5. Side effects that cross modules (for example "send an email when a lead is created") use **in-process events**, not direct calls.


---

## 7. Functional Requirements

### 7.1 Public pages

**FR-PUB-01 Home.** Sections in order:
1. **Hero** (navy block, 12-column grid): left 7 columns hold headline, sub-headline, and two buttons (*Explore courses* primary coral, *Register interest* secondary outline). Right 5 columns hold a **spec panel** (bordered key/value rows: PROGRAM, TOOLS, FORMAT, AUDIENCE, STATUS).
2. **Tools strip:** tool names as plain text in a row of bordered cells (ServiceNow, Jira, Confluence, Git, etc.). **No third-party logos.**
3. **Featured courses:** up to 3 published courses (admin can flag `featured`).
4. **How it works:** 3 steps (Learn the tool, Practise on real scenarios, Get job-ready).
5. **CTA band:** invite to register.

**FR-PUB-02 Courses.** Grid of published courses ordered by `sort_order`. Filter chips by category/tool. Each course is a bordered **spec-sheet cell**: course code, title, short description, key/value rows (duration, mode, level, tools), and a *View spec →* link. A thumbnail is optional; without one the cell shows a generated typographic tile. Empty state when no courses exist.

**FR-PUB-03 Course detail.** Title, mode, duration, level, tools, overview, syllabus accordion, "Who it's for", and an *Enquire about this course* button that opens the popup form with the course preselected. 404 for unpublished/missing slugs.

**FR-PUB-04 About.** Mission, the industry-gap story, and a placeholder block for team/trainer profiles.

**FR-PUB-05 For Colleges.** Workshop formats, student outcomes, how a campus visit works, and the **Campus Request form** (FR-FORM-02).

**FR-PUB-06 Contact.** Full student form (FR-FORM-01 full variant), email, phone, social links from settings.

**FR-PUB-07 Legal.** Privacy policy and terms pages. Footer links on every page.

### 7.2 Forms

**FR-FORM-01 Student lead form**

| Field | Popup | Contact page | Validation |
|---|---|---|---|
| Full name | Required | Required | 2 to 80 chars |
| Phone / WhatsApp | Required | Required | Indian mobile, 10 digits (optional +91) |
| Email | Required | Required | Valid email |
| College name | Required | Required | 2 to 120 chars |
| Course and year | Required | Required | free text, 2 to 60 chars (e.g. B.Tech CSE, 3rd year) |
| Courses interested in | Required (at least 1) | Required (at least 1) | multi-select of published courses |
| Consent checkbox | Required | Required | must be true |
| City | n/a | Optional | |
| Preferred mode | n/a | Optional | Online / Offline / Either |
| Skill level | n/a | Optional | Beginner / Some exposure / Intermediate |
| How did you hear about us | n/a | Optional | Poster/QR, Friend, Instagram, College event, Other |
| Honeypot field | Hidden | Hidden | must be empty |

Consent text: *"I agree to be contacted by Data Valo System about courses and workshops. I have read the Privacy Policy."* (link to `/privacy`).

Automatically captured (no user input): `source` (from `?src=`), `page_path`, `device_type` (mobile/tablet/desktop from user agent), `form_variant` (`popup` | `contact`), `created_at`, `consent_at`.

**FR-FORM-02 Campus request form (For Colleges page)**
Institution name, contact person, designation, email, phone, approximate number of students, preferred format (Seminar / Workshop / Multi-week course / Not sure), message (optional), consent checkbox. Same honeypot and rate limit.

**FR-FORM-03 Behaviour (all forms)**
- Inline validation with clear messages; submit button shows a loading state.
- Backend validation is authoritative (client validation is only for UX).
- If the backend takes longer than 5 seconds to answer (free hosting may be asleep), show `SERVER IS WAKING UP. PLEASE WAIT.` and keep waiting up to 60 seconds before showing the retry state. Never lose the user's typed data.
- Success state with a thank-you message; failure state with retry.
- Duplicate handling: if an existing lead has the same phone **or** email, update that record (merge course interests) instead of creating a duplicate.

### 7.3 Popup (the "keeps showing until filled" behaviour)

**FR-POP-01 Trigger.** Show 8 seconds after page load **or** at 40% scroll depth, whichever happens first (values come from settings).

**FR-POP-02 Persistence.** Show on a device until that device successfully submits the student form.
- On successful submit set `dv_submitted=true` in **both** `localStorage` and a cookie (1 year). If either exists, never show the popup again.
- Identification is **per browser/device, not per IP address.** College Wi-Fi puts many students behind one IP, so IP must never decide popup visibility.

**FR-POP-03 Dismissal.** If closed, it reappears on the next page navigation **or** after 120 seconds, whichever is first. Track `dv_dismiss_count` and `dv_last_dismissed_at` in localStorage.

**FR-POP-04 Fatigue fallback.** After 5 dismissals, stop the blocking popup and show a small sticky **"Register interest"** tab on the screen edge (non-blocking). Clicking it opens the form. The tab disappears once submitted.

**FR-POP-05 Suppression.** Never show on `/contact` (full form already there), `/privacy`, `/terms`, or any `/admin` route. Never show if `popup_enabled=false` in settings.

**FR-POP-06 Presentation.** Titled panel per section 10.4: centred modal on desktop; bottom sheet on mobile. Focus-trapped, closable via Esc and a visible close button, `role="dialog"` with `aria-modal`, locks background scroll, respects `prefers-reduced-motion`.

**FR-POP-07 Programmatic open.** Header button, course page button, and sticky tab can open the same form; opening with a `courseId` preselects that course.

**FR-POP-08 Robustness.** If storage is blocked or unavailable, fall back to in-memory state (popup still works, may reappear after reload). Logic lives in a single, unit-tested module.

### 7.4 Admin

**FR-ADM-01 Auth.** Email + password. Admin accounts live in the `admins` collection with **bcrypt-hashed** passwords. There is no sign-up route; admins are created by a seed script. The **backend** issues a signed, `httpOnly`, `Secure` (in production), `SameSite=Lax` session cookie (JWT, 8-hour expiry). Frontend admin pages verify the session by calling `GET /api/admin/auth/me`; unauthenticated visits to frontend `/admin/*` redirect to `/admin/login`. Unauthenticated calls to backend `/api/admin/*` return 401, independent of what the frontend does. Login attempts are rate limited (5 per 15 minutes per IP hash) and failures show one generic message. Session expiry is handled gracefully.

**FR-ADM-02 Courses CRUD.** Create, edit, delete (with confirmation), publish/unpublish, mark featured, drag or arrow-based reorder, thumbnail upload (JPG/PNG/WebP, max 2 MB). Fields:

| Field | Type |
|---|---|
| title | text, required |
| slug | text, unique, auto-generated from title, editable |
| short_description | text, max 160 chars |
| overview | long text |
| syllabus | list of modules, each with a title and a list of topics |
| category | text (e.g. ITSM, Project Management) |
| tools | list of tags |
| level | Beginner / Intermediate / Advanced |
| mode | Online / Offline / Hybrid |
| duration | text (e.g. "6 weeks") |
| audience | text ("Who it's for") |
| fee | optional number; hidden on the public site if empty |
| code | text, optional, e.g. `SN-101`; shown as the course ID |
| thumbnail | image, optional (falls back to a generated typographic tile) |
| status | draft / published |
| featured | boolean |
| sort_order | integer |

**FR-ADM-03 Leads.** Table with search (name, email, phone, college), filters (college, source, course, date range, form variant), sort, pagination, a detail drawer, delete, and **CSV export** of the current filtered view.

**FR-ADM-04 Campus requests.** Table and detail view, CSV export.

**FR-ADM-05 Settings.** Edit: popup on/off, delay seconds, scroll %, re-appear seconds, max dismissals, contact email, phone, social links.

**FR-ADM-06 Overview.** Counts (total leads, last 7 days, top 5 sources, top 5 courses) and the latest 10 leads.

**FR-ADM-07 (Should) QR link helper.** Input a campus name and generate `https://<domain>/?src=<slug>` with a copyable URL.

### 7.5 Source attribution

**FR-SRC-01** On first landing, read `?src=` and store in `sessionStorage` and `localStorage` (`dv_src`) so it survives navigation. Include in every form submission. Sanitise to `[a-z0-9-]`, max 40 chars.

---

## 8. Data Model (summary)

**Database:** MongoDB Atlas **Free cluster**, accessed with Mongoose from the **backend only** (the frontend has no database access and no database credentials). Each collection is owned by exactly one backend module (section 6.4). Model definitions and indexes are in `IMPLEMENTATION_PLAN.md`, Phase 3.

| Collection | Purpose |
|---|---|
| `courses` | See FR-ADM-02. `syllabus` is an embedded array of `{ title, topics[] }`. `code` is an optional course ID. The optional thumbnail is stored as `{ url, publicId }` (image file hosted on Cloudinary's free tier) |
| `leads` | Personal data, `consent` and `consentAt`, `interestedCourseIds` (array of ObjectIds), `source`, `pagePath`, `deviceType`, `formVariant`, optional fields |
| `campus_requests` | See FR-FORM-02 |
| `site_settings` | Single document (`key: "main"`) holding popup and contact settings |
| `admins` | `email` (unique), `passwordHash` (bcrypt) |
| `rate_limit_events` | `ipHash`, `route`, `createdAt`. A **TTL index deletes entries after 24 hours automatically** |

**Privacy rule:** raw IP addresses are **never** stored. IPs are hashed with a server-side secret solely for rate limiting.

## 9. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | **Performance:** mobile LCP under 2.5s on 4G; use `next/image`, font subsetting, minimal client JS; the popup component is lazy-loaded |
| NFR-02 | **Responsive:** 360px to 1440px+; touch targets at least 44px |
| NFR-03 | **Accessibility:** WCAG 2.1 AA, keyboard navigable, visible focus, labelled inputs, error messages tied to fields |
| NFR-04 | **SEO:** unique title and meta description per page, Open Graph tags, `sitemap.xml`, `robots.txt`, semantic headings, JSON-LD `Organization` and `Course` |
| NFR-05 | **Security:** the database is reachable **only from the backend**; the browser and the Next.js app never connect to it. Every `/api/admin/*` route requires a valid admin session, checked **in the backend** (not only in the frontend). Backend validates all input (Zod). **NoSQL-injection safe:** typed inputs only, request keys starting with `$` or containing `.` are rejected, raw request objects never reach Mongo filters, user text is escaped before use in `$regex`. **CSRF defence:** `SameSite=Lax` cookie plus an `Origin` check on state-changing requests. CORS allows only the frontend origin. Honeypot plus rate limit (max 10 submissions per hour per IP hash). HTTPS only. Secure headers (helmet on the backend, CSP on the frontend). No secrets in the frontend bundle. Atlas database user limited to `readWrite` on this one database |
| NFR-06 | **Privacy/compliance:** consent captured with timestamp; privacy policy states what is collected, why, retention, and how to request deletion (India DPDP Act, 2023); admin can delete a lead |
| NFR-07 | **Reliability:** form submission never loses data silently; errors surfaced to the user |
| NFR-08 | **Maintainability:** **JavaScript (ES modules) only, no TypeScript, in both apps**. ESLint and Prettier clean. Backend follows the modular-monolith rules in section 6.4, enforced by an automated architecture check. The HTTP contract is documented in `docs/API.md` and updated with every endpoint change. Each app has its own `.env.example` |
| NFR-09 | **Legal/branding:** do not use third-party trademarked logos (ServiceNow, Atlassian/Jira); tool names appear as plain text only |
| NFR-10 | **Free-tier constraints (Atlas Free cluster):** design for 0.5 GB storage, 100 operations per second, no automated backups, and auto-pause after 30 days with no connections (limits per current Atlas docs; re-check before launch). Use one cached connection per server instance, indexed queries, cached/revalidated public pages, a keep-alive health check, and a documented backup routine |
| NFR-11 | **Separate deployment:** frontend and backend build, test, and deploy independently (frontend on a Next.js host such as Vercel, backend on a Node host). The backend exposes `GET /api/health`. The system tolerates a sleeping free-tier backend (slow first request, see FR-FORM-03) |

## 10. Design System: Utilitarian

### 10.0 Direction

**Utilitarian design is function-first, clean, and direct.** It puts clarity ahead of aesthetics and has a rugged, industrial, technical-manual feel (think equipment manuals, signage, and utility software). That suits a company that teaches the internal tools of the software industry: the site should feel like a well-made spec sheet, not a brochure.

**Core elements:** visible grid layout, monospaced/industrial type, muted tones, absence of decoration.

**Principles**
1. **Function first.** Every element must inform or enable an action. If it does neither, remove it.
2. **The grid is the layout.** Content sits in a visible 12-column structure divided by 1px rules, like a table or a form on a drawing.
3. **No decoration.** No rounded corners, shadows, gradients, textures, illustrations, stock photos, emoji, glass effects, or decorative animation.
4. **Spec-sheet language.** Labels, codes, indexes, and key/value rows instead of marketing flourishes.
5. **Muted palette, one signal colour.** Navy ink on cream paper. Coral appears only as a signal (primary action, active state, status marker).
6. **Terse copy.** Short, direct, imperative sentences. No hype adjectives.

### 10.1 Colour tokens

| Token | Hex | Role |
|---|---|---|
| `--navy` | `#0B1F3A` | **Ink:** text, 1 to 2px structural rules, header/footer/hero blocks, **text on coral buttons** |
| `--cream` | `#F7F1E3` | **Paper:** page background |
| `--sand` | `#EADFC8` | Panels, table header rows, row hover |
| `--rule-soft` | `#CFC3A8` | Inner hairline dividers only (never the sole boundary of an input or button) |
| `--navy-soft` | `#3A4A66` | Secondary text, labels (about 7.9:1 on cream) |
| `--coral` | `#F2543D` | **Signal only:** primary button fill, active nav marker, status flags |
| `--error` | `#B3261E` | Error text and borders (about 5.8:1 on cream) |
| `--white` | `#FFFFFF` | Input backgrounds |

**Contrast rules (verified):**
- Navy on cream: pass (AAA)
- **Navy text on coral: about 4.8:1, passes AA.** Always use navy text on coral fills.
- **Never put white or cream text on coral** (about 3.0 to 3.4:1, fails AA)
- **Never use coral as text on cream** (about 3.0:1, fails AA)
- Coral text on navy is allowed for short labels (about 4.8:1)
- Errors use `--error`, never coral

### 10.2 Typography

- **IBM Plex Mono:** headings, nav, labels, buttons, tables, codes, numbers
- **IBM Plex Sans:** body paragraphs and long text
- Load both via `next/font` (subset `latin`, `display: swap`)
- Headings: Plex Mono 600, **sentence case**, line-height 1.2
- Labels: Plex Mono 500, **UPPERCASE**, 12px, letter-spacing 0.08em (12px is the minimum size on the site)
- Body: Plex Sans 400, 16px, line-height 1.5
- Numbers use `font-variant-numeric: tabular-nums`
- Scale (px): 12 / 14 / 16 / 20 / 28 / 40 / 56. Mobile H1 is 28 to 32px because Plex Mono is wide.

### 10.3 Layout and grid

- Max content width **1200px**; **12 columns** on desktop, 8 on tablet, 4 on mobile
- Spacing scale in multiples of 4px (4, 8, 16, 24, 32, 48, 64)
- Cells sit **edge to edge** with shared 1px navy borders (`gap: 0`), so the grid reads like a table. The outer container has a 1px navy border.
- Sections are separated by full-width 1px navy rules
- **Section header pattern:** a mono label such as `[01] COURSES` on the left, a rule beneath it, and optional meta text on the right
- **Header:** mono wordmark `DATA-VALO-SYSTEM` on the left; nav as a row of bordered cells; the active page has a **3px coral bar** under it; the *Register interest* button sits on the far right. On mobile the nav becomes a `MENU` text button opening a full-width list of numbered rows.
- **Footer:** navy block, labelled columns (SITE / CONTACT / LEGAL), a meta line such as `DATA VALO SYSTEM / DOC DV-WEB-01`
- Mobile: cells stack in one column with horizontal rules between them

### 10.4 Components

| Component | Specification |
|---|---|
| **Button** | Rectangular, 0 radius, 2px navy border, Plex Mono uppercase 14px, min height 44px. **Primary:** coral fill, navy text; hover inverts to navy fill, cream text. **Secondary:** transparent, navy border; hover fills sand. Trailing text arrow `→` where it implies navigation. Focus: 3px navy outline, 2px offset (cream outline on navy backgrounds) |
| **Course cell** | Bordered cell. Top row: course code (left), mode flag (right). Then title, short description, then key/value rows (`DURATION`, `MODE`, `LEVEL`, `TOOLS`) separated by 1px `--rule-soft` lines. Bottom row: `VIEW SPEC →`. Optional thumbnail in a 4:3 bordered frame, unfiltered. Fallback: a generated **typographic tile** (course code and tool name in large mono type on sand) |
| **Tag / chip** | Square, 1px navy border, bracket style such as `[ITSM]`. Selected filter chip: navy fill, cream text |
| **Input** | White background, 1px navy border (2px on focus), 0 radius, min height 44px. Label above in uppercase mono with an index, e.g. `01 FULL NAME`. Helper text below in navy-soft |
| **Error state** | 2px `--error` border and the message `ERROR: <text>` in `--error` below the field. An `ERROR` word is always present so colour is never the only signal |
| **Accordion (syllabus)** | Table rows. Left: index `M1`, `M2`. Right: `+` / `−` text glyph. 1px rules between rows. Open and close instantly |
| **Dialog (popup)** | Rectangular panel, 2px navy border. Navy title bar with cream mono text `FORM DV-01 / REGISTER INTEREST` and a `[X]` close button. Desktop: centred, max width 520px. Mobile: full-width bottom sheet. Backdrop: flat navy at 60% opacity, **no blur** |
| **Sticky tab (fallback)** | Fixed to the right edge, vertical text `REGISTER INTEREST`, coral fill, navy text, 2px navy border |
| **Toast** | Bordered rectangle, bottom-left, prefixed `OK:` or `ERROR:` |
| **Table (admin)** | Dense rows, tabular numerals, 1px rules, sticky header on sand, row hover sand, no zebra stripes |
| **Icons** | Avoid. Prefer text glyphs (`→ ↗ + − ×`) and square bullets. Where an icon replaces a word the user must read (menu, close, external link), use `lucide-react` at 20px with square line caps |
| **Imagery** | No stock photos, illustrations, gradients, or textures. Allowed: generated typographic tiles, tables, diagrams, and real material supplied by the client. Do not use screenshots of third-party tools unless the client confirms permission |
| **Motion** | No decorative animation and no scroll effects. State changes (hover, focus, accordion, dialog) are instant or 100ms at most. Respect `prefers-reduced-motion` |

### 10.5 Page patterns

- **Home hero:** navy block. Left: H1, sub-headline, two buttons. Right: spec panel with rows `PROGRAM / TOOLS / FORMAT / AUDIENCE / STATUS`.
- **Tools strip:** a single row of bordered cells, one tool name each, plain text.
- **Featured courses:** three course cells in a row (stacked on mobile).
- **How it works:** three numbered cells: `01`, `02`, `03`, each with a label and one sentence.
- **CTA band:** cream background, 2px navy border, one sentence, one coral button. (Not a full coral band; coral stays rare.)
- **Course detail:** two columns. Left: overview and syllabus accordion. Right: sticky spec panel (CODE, DURATION, MODE, LEVEL, TOOLS, AUDIENCE, FEE if set) with the *Enquire* button.
- **Forms:** single column, numbered fields, required fields marked `REQUIRED` in the label (not just an asterisk).

### 10.6 Placeholder copy (agents may refine tone, not meaning)

- **Hero H1:** "Learn the tools real software teams use."
- **Sub:** "Hands-on training in ServiceNow, Jira, and related enterprise tools. Built for college students."
- **Buttons:** "Explore courses →" (primary) and "Register interest" (secondary)
- **Hero spec panel:** `PROGRAM: Industry tools training` · `TOOLS: ServiceNow, Jira, and more` · `FORMAT: Online / Offline` · `AUDIENCE: College students` · `STATUS: Registering interest`
- **How it works:** `01 Learn the tool` · `02 Practise on real scenarios` · `03 Get job-ready`
- **Tone examples:** "Duration: 6 weeks." not "A transformative journey." · "Request a campus visit." not "Let's partner to shape futures."

### 10.7 Design checklist for agents

- [ ] `border-radius: 0` everywhere (the only exception is the browser's native focus ring)
- [ ] No `box-shadow`, `text-shadow`, `filter: blur`, `backdrop-filter`, gradients, or background images
- [ ] No animation beyond 100ms state changes
- [ ] Labels are mono uppercase 12px; headings are mono sentence case
- [ ] All structure comes from 1px rules and the grid, not from spacing tricks or boxes with fills
- [ ] Coral is used only for primary action, active marker, or status flag
- [ ] All colours come from tokens; no hex values in components

## 11. Analytics (Should have)
Privacy-friendly analytics (Vercel Analytics or Plausible). Track page views, popup shown, popup dismissed, form submitted, and `src` distribution. No third-party ad pixels.

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Popup annoys users and hurts mobile SEO | Delay, bottom sheet on mobile, sticky-tab fallback after 5 dismissals |
| Shared campus IPs break IP-based logic | Device-based persistence only; IP used just for rate limiting |
| Spam or fake submissions | Honeypot, rate limit, server validation |
| Trademark complaints | No third-party logos; text mentions only |
| Data protection exposure | Consent, minimal data, server-only database access, deletion path, no raw IPs |
| Incognito or cleared storage re-shows popup | Accepted limitation, documented |
| Free cluster pauses after inactivity, or hits its storage/ops caps | Weekly keep-alive health check, cached public pages, regular backups, and an upgrade path to a paid Atlas tier if traffic grows |
| Atlas IP allow-list must be wide open because hosting IPs are not fixed | Strong random DB password, least-privilege DB user, TLS, and all DB access kept in the backend |
| Free backend host sleeps when idle (slow first request, lost leads) | Uptime ping to `/api/health` every 10 minutes, "waking up" message and 60-second wait in forms, typed data never discarded |
| Cross-site cookie problems between separate frontend and backend domains | Browser calls go through the Next.js `/api/*` rewrite so cookies stay first-party |
| Real client IP lost behind two proxies (breaks rate limits and hashing) | Configure trusted proxy hops, verify in QA that different clients get different IP hashes |
| Frontend and backend drift out of sync | `docs/API.md` is the contract and is updated in the same change as any endpoint |

## 13. Release Criteria (Definition of Done for MVP)
- [ ] All Must-have FRs implemented and verified
- [ ] Popup logic unit tests pass and the browser-agent scenarios in the implementation plan pass
- [ ] Authorization verified: anonymous requests cannot read leads, campus requests, or draft courses, and cannot call any `/api/admin/*` route
- [ ] NoSQL-injection payloads are rejected by every public form and API route
- [ ] Backend architecture check passes (no cross-module access to internals); no TypeScript files exist in either app
- [ ] Frontend and backend each install, build, and deploy independently; `docs/API.md` matches the implemented endpoints
- [ ] Backup routine documented and tested once
- [ ] Lighthouse targets met on Home and Courses (mobile)
- [ ] Privacy and Terms pages live; consent is stored with each lead
- [ ] Admin can create, publish, and reorder a course and export leads as CSV
- [ ] `.env.example`, README, and an admin handover guide are written

## 14. Open Questions (confirm with the client)
1. Final domain name and contact email/phone
2. Logo and brand assets (a text-based wordmark is used until supplied)
3. Founder/trainer bios and photos for About
4. Initial course list and syllabus content
5. Whether course fees should be shown publicly
6. Who receives lead notification emails