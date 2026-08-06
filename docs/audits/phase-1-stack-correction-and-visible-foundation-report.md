# Phase 1 Stack Correction and Visible Foundation Report

## 1. Executive Summary

This phase corrected the package manager from pnpm to npm and replaced every placeholder route with real, verified-content pages, turning the repository from a structurally-correct-but-empty foundation into a visible first version of the professional portfolio.

- **Scope:** (a) migrate pnpm → npm workspaces, one root lockfile; (b) build a real, visible homepage and application shell; (c) build honest first-version `/work`, `/about`, `/beyond`, `/contact`, `/resume` pages using only content verified in `CONTENT_CHECKLIST.md`.
- **Final status:** COMPLETE
- **Ready for the design-system phase (Phase 2):** Yes.

## 2. Reason for Correction

The user's explicit stack decision requires **npm**, not pnpm, for package management, alongside React + Vite + JavaScript + React Router DOM + Tailwind CSS + Node.js/Express.js. The prior correction (commit `acbed68`, `docs/audits/phase-1-architecture-correction-report.md`) had already fixed the framework/language architecture (client/server split, JavaScript-only, Express backend — all correct and retained) but used pnpm as the package manager and shipped placeholder-only pages. This phase corrects the package manager and replaces the placeholders with real content — it does not redo the client/server split.

## 3. Repository Safety

- **Working directory:** `C:\Users\TP\Desktop\portfolio`
- **Git root before and after:** `C:/Users/TP/Desktop/portfolio` (unchanged)
- **Branch:** `master`
- **Previous HEAD:** `acbed684e143d4828eeb24fbbb79a35f8d6fffa6` (`refactor: migrate portfolio to react express javascript`) — not amended, not rewritten.
- **Parent repository (`C:\Users\TP\.git`):** not touched.
- **Remote:** none configured.
- **Pushed:** No. **Deployed:** No.

## 4. Removed Stack

- `pnpm-lock.yaml` and `pnpm-workspace.yaml` deleted from the repository root.
- The `packageManager: "pnpm@11.20.0"` field removed from the root `package.json`.
- All `pnpm`/`pnpm --filter` commands replaced with `npm`/`npm run --workspace=` equivalents in root scripts, `.github/workflows/ci.yml`, `client/playwright.config.js` (webServer command), `.prettierignore`, and documentation.
- **Cleanup finding:** an earlier, now-fixed `client/playwright.config.js` still invoked `pnpm build && pnpm preview` as its Playwright `webServer` command. Before that was fixed, one failed test run caused pnpm (still present on `PATH` from an earlier phase) to silently create a full pnpm-style install inside `client/node_modules/.pnpm/…` plus stray `client/pnpm-lock.yaml` and `client/pnpm-workspace.yaml` files. All of this was untracked (git-ignored) but was deleted, and `node_modules` at every level was removed and reinstalled fresh via `npm install` to guarantee every validation command in this report ran against genuinely npm-managed packages, not leftover pnpm ones.
- `.gitignore` unchanged (already excludes `node_modules/`, `.env`, etc. — no changes needed for the package-manager switch).
- No CI steps were removed beyond the earlier-completed `typecheck` removal; this phase only changed `pnpm`/Corepack invocations to `npm ci` / `npm run`.

**TypeScript check:** Confirmed zero `.ts`/`.tsx` project files remain (unchanged from the prior correction — re-verified, not assumed).

## 5. New npm Workspace

Root `package.json`:

```json
{
  "name": "jahid-portfolio",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["client", "server"],
  "engines": { "node": ">=20" }
}
```

- One lockfile: root `package-lock.json`. No lockfiles inside `client/` or `server/`.
- `npm ls --workspaces --depth=0` confirms both `@portfolio/client` (`./client`) and `@portfolio/server` (`./server`) resolve correctly as workspace packages under `jahid-portfolio@1.0.0`.
- Root scripts: `dev`, `dev:client`, `dev:server`, `build`, `preview`, `lint`, `test`, `test:client`, `test:server`, `test:e2e`, `format`, `format:check`, `check`, `check:full` — all using `npm run … --workspace=…` / `--workspaces --if-present`.

## 6. Client Architecture

- `client/src/App.jsx` — thin: only mounts `createBrowserRouter`/`RouterProvider`.
- `client/src/routes/route-config.jsx` — nests all routes under a new `AppLayout` layout route (header + `<Outlet/>` + footer), replacing the previous flat per-route `errorElement` structure.
- `client/src/layouts/AppLayout.jsx` — shared shell: skip link, `SiteHeader`, `<main id="main-content">`, `SiteFooter`.
- `client/src/components/navigation/SiteHeader.jsx` + `MobileMenu.jsx` — `JH.` monogram, primary nav (Home/Work/About/Beyond/Contact/Résumé) with active-route styling via `NavLink`, and a functional mobile menu (toggle button with `aria-expanded`/`aria-controls`, Escape closes it, focus moves to the first link on open).
- `client/src/components/layout/SiteFooter.jsx` — name, title, location, GitHub/LinkedIn/email links, dynamically generated copyright year.
- `client/src/components/ui/` — `Container`, `ButtonLink` (primary/secondary/ghost variants, disabled state renders a non-interactive `<span>` rather than a dead link), `SectionLabel`, and the retained `RoutePlaceholder` (now used only by `NotFoundPage` and the project-not-found state).
- `client/src/sections/home/` — `HeroSection`, `CredibilityStrip`, `FeaturedProjectsPreview`, `CapabilitiesPreview`, `JourneyPreview`, `BeyondPortal`, `ContactCta`.
- `client/src/data/` — `profile.js`, `credibility.js`, `capabilities.js`, `journey.js`, `leadership.js`, `projects.js` — all sourced from `CONTENT_CHECKLIST.md`; no invented fields.
- `client/src/hooks/usePageMeta.js` — renamed from `use-document-head.js`/`useDocumentHead` to match the naming this phase's spec requested; sets/restores `document.title` and the meta description per route.
- `client/src/lib/api.js` — now exports `API_BASE_URL` and `getApiHealth()` (renamed from `checkApiHealth`) using native `fetch`; not surfaced in the public UI.
- `client/src/styles/app.css` — Tailwind CSS 4 with `@theme` tokens (`--color-background`, `--color-surface`, `--color-text`, `--color-accent`, etc.) and custom base rules wrapped in `@layer base` (see Section 21 for why this mattered).
- `client/.env.example` — `VITE_API_BASE_URL=http://localhost:5000`.

**Versions:** React 19.2.8, React DOM 19.2.8, React Router DOM 7.18.2, Vite 7.3.6, Tailwind CSS 4.3.3, Vitest 3.2.7, @playwright/test 1.62.1. JavaScript only — confirmed via the zero-`.ts`/`.tsx` scan.

## 7. Server Architecture

- Renamed to match this phase's naming convention: `server/src/routes/healthRoutes.js`, `server/src/controllers/healthController.js`, `server/src/middleware/notFound.js`, `server/src/middleware/errorHandler.js` (all `git mv`, imports updated in `server/src/app.js` and `server/tests/unit/errorHandler.test.js`).
- `GET /` now returns `{ success: true, service: "jahid-portfolio-api", message: "..." }` — a minimal API-identification response.
- `GET /api/health` unchanged in contract: `{ success, service, status: "ok", timestamp, environment }`.
- Unknown `/api/*` → `404 { success: false, error: "Not found", path }`.
- Centralized error handler unchanged: never exposes stack traces; includes `detail` only outside production for 500s.
- `server/src/app.js` exports the Express app without calling `.listen()`; `server/src/server.js` is the only file that starts the HTTP server (confirmed: server tests import `app.js` directly via Supertest, no live listener is started during tests).

**Versions:** Node.js v23.10.0 (satisfies `engines.node >=20`; CI pins Node 22), Express 5.2.1, cors 2.8.6, helmet 8.3.0, dotenv 17.4.2, nodemon 3.1.14, supertest 7.2.2, Vitest 3.2.7.

## 8. Visible Homepage Implementation

The homepage no longer shows "Portfolio foundation / This section is prepared for Phase 4 implementation." It now renders, in order:

1. **Hero** — label "Frontend Developer · Junior Software Engineer", H1 "I build clear interfaces for real product problems.", support copy, three CTAs (View Selected Work, About Me, Résumé — rendered as a disabled control since no PDF exists yet), and a CSS-only technical panel (grid background, monogram, availability indicator, metadata block). No fake terminal, no Matrix rain.
2. **Credibility strip** — CSE graduate/Metropolitan University, 250+ problems solved, React-focused, Sylhet Bangladesh, open to frontend/junior roles.
3. **Featured projects preview** — Sarabo, Bang Learner, Note Bank, each with verified summary, stack, and an honest status label ("Live — case study in preparation" / "Repository available — case study in preparation"); links to `/work`.
4. **Capabilities preview** — Frontend / Engineering Foundation / Currently Expanding categories, no percentage bars.
5. **Journey preview** — five-step indexed trajectory, no invented dates.
6. **Beyond portal** — photography/sports/leadership teaser linking to `/beyond`.
7. **Contact CTA** — availability statement, link to `/contact`.

## 9. Route Report

| Route | Component | H1 | Metadata | Direct load | Result |
|---|---|---|---|---|---|
| `/` | `HomePage` → `HeroSection` | "I build clear interfaces for real product problems." | Unique title/description | Verified (Playwright) | PASS |
| `/work` | `WorkPage` | "Projects I've built" | Unique | Verified | PASS |
| `/work/:slug` | `ProjectDetailsPage` | "Project not found" (unknown) / project title (known, "case study in preparation") | Unique | Verified for both known and unknown slugs | PASS |
| `/about` | `AboutPage` | "About Jahid" | Unique | Verified | PASS |
| `/beyond` | `BeyondPage` | "Beyond the code" | Unique | Verified | PASS |
| `/contact` | `ContactPage` | "Get in touch" | Unique | Verified | PASS |
| `/resume` | `ResumePage` | "Résumé" | Unique | Verified | PASS |
| `/*` | `NotFoundPage` | "Page not found" | Unique | Verified | PASS |

## 10. API Report

| Method | Endpoint | Status | Response contract | Test result |
|---|---|---|---|---|
| GET | `/` | 200 | `{ success: true, service, message }` | PASS |
| GET | `/api/health` | 200 | `{ success: true, service, status: "ok", timestamp, environment }` | PASS (4 integration tests) |
| GET | `/api/*` (unknown) | 404 | `{ success: false, error: "Not found", path }` | PASS |
| * | Error middleware | 500 (or `err.status`) | `{ success: false, error, ...(non-prod detail) }`, no stack trace | PASS (2 unit tests) |

## 11. Dependency Report

No dependency was added or removed relative to the prior correction's approved list, except the root `package-lock.json` replacing `pnpm-lock.yaml`/`pnpm-workspace.yaml`. `lucide-react`, `clsx`, and `tailwind-merge` were explicitly permitted by this phase's spec but were **not installed**, since the current UI doesn't need an icon set or conditional class merging yet (the mobile-menu toggle uses plain Unicode glyphs). `CLAUDE.md` was updated to reflect this honestly rather than claim they're installed.

`npm audit` reports 2 high-severity advisories, both from the same underlying `react-router` GHSA (`GHSA-qwww-vcr4-c8h2`, "RSC Mode CSRF Bypass"). This advisory is specific to React Router's RSC/server-action mode. This project uses `react-router-dom` in pure client-side SPA mode (`createBrowserRouter`/`RouterProvider`, no server actions, no RSC) — not exploitable in this configuration. `npm audit fix` (non-breaking) reported no available in-range fix; a fix exists only outside the `^7` semver range this project pins, so no forced upgrade was applied. This is flagged for review rather than silently ignored.

## 12. JavaScript-Only Verification

```bash
find . -path './node_modules' -prune -o -path './.git' -prune -o \
  -path './dist' -prune -o -path './build' -prune -o -path './coverage' -prune -o \
  \( -name '*.ts' -o -name '*.tsx' -o -name 'pnpm-lock.yaml' -o -name 'pnpm-workspace.yaml' \) -print
```

Result: **no output** (zero `.ts`, zero `.tsx`, zero `pnpm-lock.yaml`, zero `pnpm-workspace.yaml`).

- `.ts` files: 0
- `.tsx` files: 0
- TypeScript dependencies: 0
- `tsconfig*.json` files: 0
- **JavaScript-only verdict: PASS**

## 13. npm Verification

- `package-lock.json`: **PRESENT** (root only).
- `pnpm-lock.yaml`: **REMOVED** (root; also cleaned from `client/` where it had been stray-created — see Section 4).
- `pnpm-workspace.yaml`: **REMOVED** (root and stray `client/` copy).
- `npm ls --workspaces --depth=0`: **PASS** — both workspace packages resolve.
- All `node_modules` (root, `client/`, `server/`) were deleted and reinstalled from a clean state via `npm install` partway through this phase, specifically to eliminate the stray pnpm-installed packages described in Section 4 and guarantee every test below ran against npm-managed dependencies only.

## 14. Testing Results

- **Client unit/integration tests:** 15/15 passed, 0 failed, 0 skipped, across 8 files (added this phase: `SiteHeader.test.jsx` — primary nav links + mobile menu open/close; `ResumePage.test.jsx` — no dead PDF link while unavailable; updated: `HomePage.test.jsx`, `AppRoutes.test.jsx` for the new real headings).
- **Server tests:** 6/6 passed, 0 failed, 0 skipped (unchanged from the prior correction, plus the file renames in Section 7).
- **Playwright e2e:** 15/15 passed, 0 failed, 0 skipped — covers all seven main routes' H1s, unknown-route 404, navigation-by-click to Work/About/Beyond/Contact, browser back/forward, direct-navigation refresh, and mobile navigation (open menu → click a link → menu closes → correct page renders).
- **Axe:** 0 violations on the home page (this required a real fix — see Section 21).
- **A note on the spec's "Homepage passes an Axe scan" unit-test item:** this project's only approved Axe integration is `@axe-core/playwright` (browser-based); there is no approved jsdom/Vitest Axe package in the dependency list. Rather than install an unlisted package, this requirement is covered at the Playwright layer (`tests/e2e/axe.spec.js`), consistent with how the prior phases handled Axe coverage.

## 15. Validation Commands

| Command | Exit code | Result | Notes |
|---|---|---|---|
| `npm install` | 0 | PASS | Run twice — once initially, once again after the clean-node_modules fix in Section 4 |
| `npm run format` | 0 | PASS | No content changes on the second (clean) run |
| `npm run format:check` | 0 | PASS | "All matched files use Prettier code style!" |
| `npm run lint` | 0 | PASS | Client and server both clean |
| `npm run test:client` | 0 | PASS | 15/15 tests, 8 files |
| `npm run test:server` | 0 | PASS | 6/6 tests, 2 files |
| `npm run build` | 0 | PASS | `client/dist`: `index.html` 0.73 kB, CSS 16.30 kB (4.09 kB gzip), JS 312.23 kB (97.81 kB gzip) |
| `npm run test:e2e` | 0 | PASS | 15/15 Playwright tests |
| `npm run check` | 0 | PASS | format:check + lint + test:client + test:server + build |
| `npm run check:full` | 0 | PASS | check + test:e2e |
| `find` (TS/pnpm artifact scan) | 0 | PASS | No output |
| `npm ls --workspaces` | 0 | PASS | Both workspace packages resolve |
| `git diff --check` | 0 | PASS | No whitespace/conflict-marker errors |

## 16. Accessibility Result

- **Semantic headings:** one visible `<h1>` per route, logical `h1 → h2 → h3` nesting on content-heavy pages (About, Résumé).
- **Keyboard-accessible links:** all navigation, CTAs, and footer links are real `<a>`/`<Link>` elements; the disabled résumé CTA is a non-interactive `<span aria-disabled="true">`, not a focusable dead link.
- **Focus styles:** global `:focus-visible` outline in the accent color, defined inside `@layer base` (see Section 21).
- **Mobile menu:** toggle button has `aria-expanded`/`aria-controls`/a descriptive `aria-label`; Escape closes it; focus moves to the first link on open.
- **Skip link:** present, visually hidden until focused, targets `#main-content`.
- **Error-state accessibility:** `ErrorPage` and `NotFoundPage` both provide a heading and a recovery link back to the homepage.
- **Axe result:** 0 violations on the home page (Playwright).
- **Known limitation:** Axe was only run against the home page, per the spec's explicit test list; other routes were not automatically scanned this phase.

## 17. Security and Environment

- `.env.example` present for both `client/` (`VITE_API_BASE_URL`) and `server/` (`PORT`, `NODE_ENV`, `CLIENT_ORIGIN`) — no real secrets.
- No real `.env` file exists anywhere in the workspace (confirmed via filesystem search).
- `.gitignore` unchanged and still correct: excludes `.env`/`.env.*` (allowing `!.env.example`), `node_modules/`, `build/`, `dist/`, `coverage/`, `playwright-report/`, `test-results/`.
- Manual secret-pattern scan of the full staged diff found no API keys, tokens, credentials, or connection strings (see Section 4/Section 11 for the one dependency-advisory finding, which is not a secret).
- CORS: server restricts to `CLIENT_ORIGIN` (unchanged from prior phase).
- Helmet applied globally (unchanged).
- Body size limits: 100kb on JSON and urlencoded bodies (unchanged).
- Error-stack policy: never returns `err.stack`; `detail` only outside production (unchanged).

## 18. Documentation Updates

- **`CLAUDE.md`:** required-stack list corrected to npm workspaces; added "Do not use pnpm."; corrected the deferred-package list to state what's actually installed vs. merely permitted (lucide-react/clsx/tailwind-merge not yet installed); "Architecture rules" corrected from "pnpm workspace packages" to "npm workspace packages."
- **`docs/03-technical-architecture.md`:** correction notice updated to mention the pnpm→npm follow-up; Section 1 (Architecture decision), Section 4 (Initialization commands), Section 6 (folder tree — `package-lock.json` instead of `pnpm-workspace.yaml`), Section 15 (root scripts), and Section 16 (server start command) all rewritten to npm. Sections 7–14/17 (design, forms, SEO, testing intent, maintenance) left unchanged — they don't reference the package manager.
- **`docs/05-implementation-roadmap.md`:** the pnpm-based "Phase 1 Correction" entry relabeled "(superseded)" with a why-superseded note; new "Phase 1 Stack Correction + Visible Foundation" entry added with deliverables, validation summary, and known limitations.
- **`README.md`:** "Implementation Status" rewritten — current phase, npm-based stack line, new "Homepage status" line, links to this report plus both earlier (superseded) reports.
- **`CLAUDE_CODE_BUILD_PROMPTS.md`:** the pnpm-based correction's execution-history entry relabeled "(superseded)"; new entry added for this phase with report path and commit-hash pointer.
- **`CONTENT_CHECKLIST.md`:** left unchanged — no existing implementation-status section, and this phase only consumed its content, it didn't need to update it.
- **`.prettierignore`:** cleaned up — removed the stale `pnpm-lock.yaml` and `.react-router` entries (leftovers from earlier phases), added `dist` and `package-lock.json`.

## 19. Known Limitations

1. No database, contact-form API, or authentication (not required by this phase's scope; contact page links to `mailto:` only, honestly labeled as a placeholder for a future form).
2. No résumé PDF, professional portraits, or curated photography selection yet — all correctly marked unavailable/in-preparation in the UI per `CONTENT_CHECKLIST.md`, never linked as if they existed.
3. Full project case studies, the command palette, and the STORY visual identity for `/beyond` are not built yet — `/beyond` is an honest, navigable placeholder as the spec allows.
4. No deployment and no remote CI execution — nothing has been pushed.
5. Two `npm audit` high-severity advisories on `react-router`'s RSC mode remain open; not exploitable in this SPA-only configuration (see Section 11), but worth revisiting on a future dependency bump.
6. Axe was run only against the home page this phase, per the explicit test list in the spec.

## 20. Git Result

- **Branch:** `master`
- **Previous HEAD:** `acbed684e143d4828eeb24fbbb79a35f8d6fffa6`
- **New commit hash:** recorded after commit — see the console report
- **Commit subject:** `refactor: migrate portfolio to npm javascript full stack`
- **Commit author:** repository default (Jahid Hasan)
- **Files added:** 23 (new sections/data/UI-primitive/layout components, new tests, `client/.env.example`)
- **Files modified:** 28 (pages rewritten with real content, config files, CI, docs, `package.json`/`package-lock.json`)
- **Files deleted:** 4 (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, two now-unnecessary `.gitkeep` files)
- **Files renamed:** 6 (server file/test renames to camelCase; `usePageMeta.js`)
- **Working tree:** Clean after commit.
- **Pushed:** No. **Deployed:** No.

## 21. Fixes Applied During This Phase (beyond the literal spec)

These were real defects found and fixed during validation, not scope additions:

1. **CSS cascade-layer bug:** custom base styles in `client/src/styles/app.css` were written outside any `@layer` block, making them *unlayered* CSS — which the CSS cascade always ranks above any `@layer`'d rule (including Tailwind's own utilities layer), regardless of source order. This silently overrode the primary button's text-color utility (`text-[#06210a]`) with the global `a { color: inherit }` rule, producing a 1.06:1 contrast ratio (near-invisible text) that Axe caught as a serious violation. Fixed by wrapping the custom rules in `@layer base { … }` so Tailwind's utilities layer correctly wins.
2. **Stacking-context containment bug:** the mobile nav panel was originally a DOM child of the `sticky`/`z-50` `<header>`. A `position: fixed` descendant of an ancestor that establishes its own stacking context is painted within that ancestor's local stacking order, which combined with an invalid arbitrary-value CSS declaration (`top-[var(--header-height,64px)]`, later simplified to `top-16`) caused the panel to render with zero effective coverage — Playwright's mobile-navigation test failed with the click target "intercepted" by underlying homepage content. Fixed by rendering `MobileMenu` as a sibling of `<header>` (both children of a plain, non-stacking-context `<div>`) instead of nesting it inside the header.
3. **Missing test cleanup between renders:** `client/vitest.config.js` sets `globals: false`, which meant Testing Library's automatic `afterEach(cleanup)` never registered, so a test file with two `render()` calls left both DOM trees mounted simultaneously and a `getByRole` query failed with "multiple elements found." Fixed by adding an explicit `afterEach(() => cleanup())` to `client/tests/setup.js`.
4. **Playwright config still called pnpm:** `client/playwright.config.js`'s `webServer.command` was `"pnpm build && pnpm preview --port 4173"`, left over from before the npm migration — this is also the root cause of the stray pnpm artifacts described in Section 4. Fixed to `"npm run build && npm run preview -- --port 4173"`.

## 22. Next Phase Recommendation

- **Recommended next phase:** Phase 2 — Complete design system, motion, and application shell refinement.
- **Blocking issues:** 0.
- **Packages likely to become eligible in Phase 2:** `daisyui` (selective foundations only), `motion` (component/route/reveal animation), `lucide-react` (once icons are actually needed), `clsx`/`tailwind-merge` (once conditional class logic appears).
- **Files Phase 2 is expected to modify:** `client/src/styles/app.css` (full SYSTEM/STORY token set), `client/src/components/ui/*` (expanded primitive set), `client/src/sections/**`, plus new motion-related files under `client/src/features/motion/`.

## 23. Final Verdict

```text
A. STACK CORRECTION AND VISIBLE FOUNDATION COMPLETE
```
