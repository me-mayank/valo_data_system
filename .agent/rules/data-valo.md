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

