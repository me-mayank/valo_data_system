# Data Valo System — Frontend

Marketing website and lead capture frontend for **Data Valo System**.

Built strictly from `PRD.md` and `IMPLEMENTATION_PLAN.md` using the **Utilitarian Design System** (PRD §10).

## Tech Stack

- **Framework**: Next.js (App Router), Node.js active LTS
- **Language**: JavaScript (ES modules) only — strict no-TypeScript rule
- **Styling**: Tailwind CSS v4 with design tokens mapped to CSS custom properties
- **Components**: Radix UI (accessible primitives restyled to Utilitarian spec), lucide-react (used sparingly)
- **Forms & Validation**: react-hook-form + zod (UX-level checks)
- **Fonts**: IBM Plex Mono (headings, buttons, labels, tables) & IBM Plex Sans (body copy) via `next/font`
- **Testing**: Vitest + React Testing Library (unit tests), Playwright (e2e)

## Quality Scripts

```bash
# Run local development server
npm run dev

# Run ESLint on src/
npm run lint

# Run design system enforcement linter (fails on rounded corners, shadows, gradients, animation >100ms, hex codes)
npm run check:design

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run production build
npm run build
```

## Design System Reference (`/_design`)

A hidden developer showcase is available at:
`http://localhost:3000/_design`

It displays:
- All 8 color tokens (`--color-navy`, `--color-cream`, `--color-sand`, `--color-rule-soft`, `--color-navy-soft`, `--color-coral`, `--color-error`, `--color-white`)
- Typography hierarchy (IBM Plex Mono + IBM Plex Sans)
- Buttons (primary: coral fill with navy text; secondary: transparent with navy border)
- Form inputs (Input, Textarea, Select, Checkbox) in default and error states
- Tag chips (`[LABEL]`)
- Syllabus Accordion
- Lead Dialog modal / bottom sheet
- Toast notifications (`OK:` and `ERROR:`)
- Admin Table
- SpecList and CourseCell cards
- Typographic Tile (`TypeTile`) fallback
- Interactive 12-column grid overlay toggle

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `BACKEND_URL` | Yes | URL of the backend Express service (default: `http://localhost:4000`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Base public domain URL (default: `http://localhost:3000`) |
| `REVALIDATE_SECRET` | Yes | Shared secret for `/internal/revalidate` cache invalidation |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for direct thumbnail uploads |

> Note: The frontend holds NO database credentials (`MONGODB_URI`), NO auth secrets (`AUTH_SECRET`), and NO IP hash secrets (`IP_HASH_SECRET`). Those reside solely in the backend.
