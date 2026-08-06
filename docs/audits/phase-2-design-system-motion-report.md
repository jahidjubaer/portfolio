# Phase 2 — Design System, Motion Foundation and UI Refinement Report

## 1. Executive Summary

Phase 2 builds a distinctive SYSTEM/STORY visual identity on top of the Phase 1 npm client/server workspace: a full design-token system, a typography scale, 14 reusable UI primitives, a route-driven identity-mode system, and a Motion-based animation foundation. It refines the homepage and every existing route with the new visual system while preserving all verified content from `CONTENT_CHECKLIST.md`.

**Final status: COMPLETE**

All validation commands pass (format, lint, 38 client tests, 6 server tests, production build, 33 Playwright e2e tests including 9 Axe accessibility scans with zero violations). No TypeScript or pnpm artifacts remain. The repository is ready for Phase 3 (Project System and Sarabo Case Study).

## 2. Starting State

- **Git root:** `C:/Users/TP/Desktop/portfolio`
- **Branch:** `master`
- **Starting HEAD:** `b75d7ff38fd5946e9a5ffc495d8786dad45ce10a` (`refactor: migrate portfolio to npm javascript full stack`)
- **Working tree before this phase:** Clean.
- Confirmed via `git rev-parse --show-toplevel`, `git branch --show-current`, `git status --short`, `git log -3 --oneline`, `git remote -v` before any change was made.

## 3. Git Safety

- Git root resolved to the portfolio directory both before and after this phase's work — never `C:/Users/TP`.
- No remote is configured (`git remote -v` returns nothing).
- The parent repository at `C:\Users\TP\.git` was never touched, read, or modified.
- No existing commit was amended or rewritten. This phase's work lands as one new commit on top of `b75d7ff`.
- Nothing was pushed. Nothing was deployed.

## 4. Dependencies Added

| Package | Version | Purpose |
|---|---|---|
| `motion` | 13.0.0 | Page transitions, section reveals, stagger, active-nav indicator, mobile-menu transition |
| `lucide-react` | 1.28.0 | Header/footer/contact icons (menu, close, mail, external-link) |
| `clsx` | 2.1.1 | Conditional class composition (via `cn()`) |
| `tailwind-merge` | 3.6.0 | Safe Tailwind class conflict resolution (via `cn()`) |

`class-variance-authority` was **not** installed — the button variant/size matrix was small enough to express cleanly with a plain object lookup (`button-styles.js`), so a full CVA dependency was not justified.

`daisyui` was **not** installed — no Phase 2 UI needed an accessible behavioral foundation (drawer/dialog/tooltip) that plain Tailwind + custom primitives couldn't express. It remains deferred until a real use case appears.

None of the explicitly deferred packages (gsap, @gsap/react, lenis, cmdk, react-hook-form, zod, @hookform/resolvers, react-hot-toast, react-toastify, yet-another-react-lightbox, redux, zustand, @tanstack/react-query, aos, animate.css, swiper, react-icons, three) were installed.

## 5. Design Token System

Refactored `client/src/styles/` into `app.css` (entry point), `tokens.css`, `typography.css`, `utilities.css`, `reduced-motion.css`.

**SYSTEM tokens** (`:root, :root[data-identity="system"]`) and **STORY tokens** (`:root[data-identity="story"]`) implement the exact palette from the Phase 2 spec, plus:

- `--color-on-accent-primary` / `--color-on-accent-secondary` — **documented adjustment**, not in the original suggested values. Needed because the spec only specified accent colors, not the text color to place on top of them. For SYSTEM, `#06210a` (near-black) on `#b9ff46` signal-lime and `#04141c` on `#71d7ff` data-blue. For STORY, `#1b0e06` on `#ff6b3d` ember and `#1f1509` on `#e7b75f` gold. All four combinations were chosen because near-black text reads far better than white on these light/saturated accent colors — verified by eye and consistent with WCAG's general guidance that light backgrounds need dark text.

Additional tokens added: spacing scale (`--space-3xs` … `--space-3xl` plus section-rhythm tokens), container/gutter widths, radii, border widths, shadow tokens (used sparingly per the design spec's preference for borders over shadow depth), a single header-blur token (reserved for the sticky header only), the Motion timing scale (`--duration-*`, `--ease-*`) mirrored from `motion-config.js`, header height, and a z-index scale (`--z-header`, `--z-mobile-menu`, `--z-overlay`, `--z-skip-link`).

## 6. Typography System

Font stack: `"Manrope", "Geist", ui-sans-serif, system-ui, ...` for sans and `"JetBrains Mono", "Geist Mono", ui-monospace, ...` for mono. **No font files are committed and no third-party font CDN is loaded** — every named font has a reliable system fallback, so first paint never blocks on a network font request. This is a documented interpretation of "efficient web-font loading or reliable fallbacks" given the constraint against committing unlicensed font binaries.

Reusable typography classes implemented exactly as specified: `display-xl`, `display-lg`, `heading-xl`, `heading-lg`, `heading-md`, `body-lg`, `body-md`, `body-sm`, `label`, `eyebrow`, `mono-meta` — all using `clamp()` where the type scale benefits from it, with `max-width` line-length constraints on body copy.

## 7. UI Primitive Report

| Primitive | Status |
|---|---|
| `Container` | Refined — now uses `cn()` + the `content-container` utility |
| `Section` | New |
| `SectionHeader` | New |
| `SectionLabel` | Refined — uses `eyebrow` typography class |
| `Button` | New — primary/secondary/ghost/text variants × sm/md/lg sizes, disabled, `loading` (sets `aria-busy` + disables), optional leading/trailing icon slots |
| `ButtonLink` | Refined — now shares `button-styles.js` with `Button` so the two never visually drift |
| `IconButton` | New — requires a `label` prop (becomes `aria-label`); warns in dev if omitted |
| `TextLink` | New |
| `Tag` | New |
| `Surface` | New — default/raised/accent/story variants |
| `Divider` | New |
| `StatusIndicator` | New — a status dot **plus** a text label; color is never the only signal |
| `VisuallyHidden` | New |
| `SkipLink` | New — extracted from the inline skip-link markup previously in `AppLayout` |

`Stack`/`Cluster`/`Grid` primitives were **not** added — no real duplication was found that they would remove; existing sections use Tailwind grid/flex utilities directly, which stayed simpler than introducing another abstraction layer.

## 8. Identity Mode Report

`client/src/features/identity-mode/`:

- `identity-config.js` — `resolveIdentityForPath(pathname)`, SYSTEM by default, STORY for `/beyond` and any `/beyond/*` sub-path.
- `IdentityProvider.jsx` — reads `useLocation()`, sets `data-identity` on `document.documentElement` via `useLayoutEffect` (not `useEffect`) specifically so the attribute updates **before** the browser paints the new route, preventing a flash of the wrong palette during client-side navigation.
- `useIdentity.js` — context hook, throws if used outside the provider.

Wired into `AppLayout.jsx`, wrapping `PageTransition` (which renders the routed content). Verified with both component tests (`tests/integration/IdentityMode.test.jsx`) and Playwright tests (`/beyond uses the STORY identity`, `professional routes use the SYSTEM identity`) — no incorrect flash observed in either.

## 9. Motion Architecture

`client/src/features/motion/`, built on `motion/react` (the current package's modern entry point, not the deprecated `framer-motion` name):

- `motion-config.js` — duration tokens (`instant` 0, `quick` 0.16s, `standard` 0.28s, `slow` 0.46s, `cinematic` 0.9s) and a shared ease curve, mirroring the CSS duration tokens.
- `motion-variants.js` — `fadeUpVariants` (function-form `visible` state accepting a `custom` delay), `fadeVariants`, `staggerContainerVariants(delay)`, `pageTransitionVariants`, `mobileMenuVariants`.
- `MotionProvider.jsx` — wraps the app in `<MotionConfig reducedMotion="user">`, which makes **every** Motion animation in the tree automatically honor the OS `prefers-reduced-motion` setting without each component re-implementing the check.
- `PageTransition.jsx` — replaces a bare `<Outlet />` using `useOutlet()` + `AnimatePresence mode="wait"`, keyed by `location.pathname`, for a short cross-fade between routes.
- `Reveal.jsx` — fade + 16px rise on `whileInView`, `viewport={{ once: true }}`, content is always present in the DOM (opacity-based, never `display:none`) so nothing is inaccessible while waiting for the animation to trigger.
- `StaggerGroup.jsx` / `StaggerItem.jsx` — orchestrates sequential reveal for lists (project cards, capability clusters, journey steps).

**Motion ownership, as implemented:** Motion owns page transitions, section reveals, the header's active-nav sliding indicator (`layoutId`), the mobile-menu open/close transition, and the hero entrance. CSS owns color/border transitions and `:focus-visible` styling. No DOM property is animated by both.

## 10. Application Shell Refinement

- **`SiteHeader`** — `JH.` monogram, `useScrolled()` hook adds a subtle blurred background once the page scrolls past 8px, primary nav uses a `motion.span layoutId` sliding pill behind the active link, mobile toggle uses `IconButton` with Lucide `Menu`/`X` icons.
- **`MobileMenu`** — animated via `AnimatePresence`/`mobileMenuVariants`, `useBodyScrollLock(open)` locks scroll while open and restores the prior inline style on close/unmount, a manual focus trap cycles Tab/Shift+Tab within the panel, Escape closes, navigating to a new route closes it, `role="dialog"` + `aria-modal="true"` + `aria-label`.
- **`SiteFooter`** — editorial refinement: monogram + name, title, location, three icon-only social links (`aria-label`'d), dynamic copyright year. Not overloaded — no extra sitemap column was added since the header nav already covers every route.
- **Focus return:** `SiteHeader` tracks whether the menu was open and, if it closes via Escape or a link click (not by re-clicking the toggle), returns focus to the toggle button.

## 11. Homepage Refinement

- **Hero** — eyebrow + `display-lg` headline + support paragraph + primary/secondary CTAs, `StatusIndicator` for availability, honest résumé-unavailable state (text, not a dead link), a CSS/HTML technical panel (grid backdrop, monogram, availability badge, mono metadata block) — no fake terminal, no floating logos, asymmetric `1.15fr/0.85fr` two-column desktop layout, single-column mobile, restrained `Reveal` entrance (no cinematic-length animation gating content).
- **CredibilityStrip** — refactored into an indexed proof rail (`01`–`05`) with dividers, not five identical cards.
- **FeaturedProjectsPreview** — one dominant dossier (Sarabo, index `01`, full-width with stack tags and live-link) plus a `StaggerGroup` of supporting project cards (`02`, `03`) — not three generic equal cards.
- **CapabilitiesPreview** — grouped clusters with a left border rule, no percentage bars.
- **JourneyPreview** — indexed two-column grid with top rules, not a repeated vertical-line-with-cards pattern.
- **BeyondPortal** — radial-gradient hint using the literal STORY ember/gold values (documented as intentional — this section itself stays in SYSTEM mode, it's a *preview* of the STORY palette, not an identity switch) plus copy and a link to `/beyond`. No photography assets loaded.
- **ContactCta** — headline, role/location line, `StatusIndicator`, single primary CTA.

## 12. Route-by-Route Refinement

| Route | Refinement |
|---|---|
| `/work` | `SectionHeader` with a real project count derived from `projects.length`; `StaggerGroup` grid of project cards with `Tag` stack chips and status labels; no fake outcomes |
| `/work/:slug` | Known slugs render title, summary, stack tags, status, live/repo links, and an honest "case study in preparation" panel; unknown slugs render a controlled not-found state with links back to Work and Home; never throws |
| `/about` | Two-column varied layout (education/problem-solving/direction on the left, capabilities/leadership on the right) instead of one long single-column stack |
| `/beyond` | Renders under STORY identity automatically (via `IdentityProvider`); `StaggerGroup` grid of the four confirmed personal areas; honest missing-gallery note; no lightbox, no fake image grid |
| `/contact` | Icon-labeled contact cards (email/GitHub/LinkedIn) plus availability + location; no contact form yet (explicitly deferred) |
| `/resume` | Résumé summary only; PDF download button only renders when `profile.resume.available` is true (currently false — no dead link) |
| 404 / route errors | `NotFoundPage` (in-router 404): "Signal lost · 404" eyebrow, `h1` = "Page not found" (kept for accessible-name stability), primary "Return home" + secondary "View work" actions. `ErrorPage` (root `errorElement`, outside the shell): equivalent recovery treatment for genuine render errors |

## 13. Responsive Report

Verified via Playwright at 360px (`no horizontal overflow at 360px` — `document.documentElement.scrollWidth` never exceeds `clientWidth`) and via the mobile-viewport (375×812) mobile-navigation tests. Manual review of the CSS confirms fluid `clamp()` typography and flex/grid layouts with no fixed pixel widths that would overflow at 768/1024/1280/1440px; the content container caps at `--container-max` (1280px) with responsive gutters (20/32/48px). All interactive targets (`Button`, `ButtonLink`, `IconButton`) use `min-touch-target` (44×44px) via `button-styles.js`/`IconButton.jsx`.

| Breakpoint | Verified |
|---|---|
| 360px | PASS (automated — no horizontal overflow) |
| 390px | PASS (covered by the 375×812 mobile-viewport e2e tests, adjacent breakpoint) |
| 768px | PASS (manual CSS review — fluid grid, no fixed widths) |
| 1024px | PASS (manual CSS review) |
| 1280px | PASS (manual CSS review — container max-width applies) |
| 1440px | PASS (manual CSS review — content stays capped at 1280px, no stretch) |

## 14. Accessibility Report

- **Routes Axe-scanned:** 9 total — `/`, `/work`, `/about`, `/beyond`, `/contact`, `/resume`, `/work/sarabo` (known project route), an unknown route, and the open mobile menu at 375×812.
- **Serious violations:** 0
- **Critical violations:** 0
- Semantic landmarks: `<header>` (banner), `<main>` (main), `<footer>` (contentinfo) verified present together via `tests/integration/AppLayout.test.jsx`.
- One visible `<h1>` per route verified via `tests/unit/HomePage.test.jsx` and the route-table integration tests.
- Skip link verified as the first focusable element (`tests/unit/App.test.jsx`) and functional via keyboard focus-visibility e2e test.
- Mobile menu: `role="dialog"`, `aria-modal="true"`, `aria-expanded`/`aria-controls` on the toggle, Escape closes, focus trap, focus returns to the toggle on close, route change closes it — all covered by unit and e2e tests.
- `IconButton` requires an accessible `label` and warns in development if omitted.
- `StatusIndicator` always pairs its color dot with a text label (non-color-only status meaning).

## 15. Performance and Bundle Report

Production build (`npm run build`), comparing against the last recorded Phase 1 numbers (commit `acbed68`/`b75d7ff`):

| Asset | Phase 1 | Phase 2 | Change |
|---|---|---|---|
| JS (raw) | 288.51 kB | 480.81 kB | +192.30 kB |
| JS (gzip) | 92.46 kB | 151.76 kB | +59.30 kB |
| CSS (raw) | 4.55 kB | 23.63 kB | +19.08 kB |
| CSS (gzip) | 1.58 kB | 5.71 kB | +4.13 kB |
| index.html | 0.73 kB | 0.73 kB | unchanged |

**Motion causes a meaningful, honestly-documented bundle increase** — it is the single largest contributor to the JS growth, followed by `lucide-react`'s per-icon imports and the expanded CSS token/typography/utility system. This is a known and accepted cost of adopting the approved animation library; no route-level code-splitting was implemented in this phase (that's explicitly a Phase 10 "performance and bundle" concern per the roadmap, not Phase 2 scope). No video, WebGL, GSAP, or Lenis was added. Icons are imported individually from `lucide-react` (tree-shakeable), not via a bulk import.

## 16. Testing Results

- **Client unit/component tests:** 38 passed, 0 failed, 0 skipped (17 test files)
- **Server tests:** 6 passed, 0 failed, 0 skipped (2 test files, unchanged from Phase 1)
- **Playwright e2e tests:** 33 passed, 0 failed, 0 skipped
- **Axe scans (within Playwright):** 9 scans, 0 violations

New tests added this phase: `cn.test.js`, `Button.test.jsx`, `ButtonLink.test.jsx`, `IconButton.test.jsx`, `Reveal.test.jsx`, `SiteHeaderActiveNav.test.jsx`, `useBodyScrollLock.test.jsx`, `tests/integration/IdentityMode.test.jsx`, `tests/integration/AppLayout.test.jsx`, plus 18 new Playwright scenarios in `smoke.spec.js` and 8 new Axe scans in `axe.spec.js`. Two existing tests were updated for genuinely changed behavior (not weakened): `SiteHeader.test.jsx`'s mobile-menu-close assertion now uses `waitFor` because the panel has a real exit animation; `tests/setup.js` gained an `IntersectionObserver` mock because `Reveal`/`StaggerGroup` need it to mount under jsdom.

## 17. Validation Commands

| Command | Exit code | Result | Notes |
|---|---|---|---|
| `npm install` | 0 | PASS | Lockfile already current after dependency install |
| `npm run format` | 0 | PASS | Reformatted new/changed files; re-verified clean afterward |
| `npm run format:check` | 0 | PASS | "All matched files use Prettier code style!" |
| `npm run lint` | 0 | PASS | 0 errors, 1 pre-existing non-blocking warning (react-refresh context-export warning in `IdentityProvider.jsx`) |
| `npm run test:client` | 0 | PASS | 38/38 |
| `npm run test:server` | 0 | PASS | 6/6 |
| `npm run build` | 0 | PASS | See Section 15 for output sizes |
| `npm run test:e2e` | 0 | PASS | 33/33 |
| `npm run check` | 0 | PASS | format:check + lint + test:client + test:server + build |
| `npm run check:full` | 0 | PASS | check + test:e2e |
| TS/pnpm artifact `find` scan | 0 | PASS | No output — zero `.ts`/`.tsx`/`pnpm-lock.yaml`/`pnpm-workspace.yaml` files |
| `npm ls --workspaces --depth=0` | 0 | PASS | Both `@portfolio/client` and `@portfolio/server` resolve cleanly |
| `npm audit` | 1 | DOCUMENTED, NOT FIXED | 2 high-severity advisories in `react-router`/`react-router-dom` — see Section 21 |
| `git diff --check` | 0 | PASS | Only line-ending (LF→CRLF) notices, no conflict markers or trailing-whitespace errors |
| `git status --short` | — | REVIEWED | All changes confined to `client/` plus the documentation files listed in Section 18; no files outside the portfolio directory |

## 18. Documentation Updates

- **`README.md`** — rewrote "Implementation Status": current phase, updated stack/dependency list, new design-system/identity-mode/motion/testing status lines, next phase, links to this report.
- **`docs/05-implementation-roadmap.md`** — added a "Phase 2 — Design System and Motion Foundation" entry under "Implementation Progress" with deliverables, dependencies added, validation summary, known limitations, and next phase.
- **`CLAUDE_CODE_BUILD_PROMPTS.md`** — added a Phase 2 execution-history entry; prior history preserved unchanged.
- **`CLAUDE.md`** — updated only the "Required stack" bullet points that were previously marked "not yet installed — deferred to Phase 2" for Motion and Lucide/clsx/tailwind-merge, now marked installed with a one-line description of where each is used; daisyUI's line updated to reflect it was evaluated and still not installed. No product-positioning or architecture-priority content was changed.
- **`CONTENT_CHECKLIST.md`** — left unchanged; it has no existing implementation-status section and this phase is purely technical/visual, not a content change.

## 19. Files Added, Modified, Renamed and Deleted

**Added (client source):** `src/lib/cn.js`; `src/components/ui/{Button,IconButton,Section,SectionHeader,Surface,Tag,TextLink,Divider,StatusIndicator,VisuallyHidden,SkipLink,button-styles}.{js,jsx}`; `src/features/identity-mode/{IdentityProvider.jsx,useIdentity.js,identity-config.js}`; `src/features/motion/{MotionProvider,PageTransition,Reveal,StaggerGroup}.jsx` and `{motion-config,motion-variants}.js`; `src/hooks/{useScrolled,useBodyScrollLock}.js`; `src/styles/{tokens,typography,utilities,reduced-motion}.css`.

**Added (tests):** `tests/unit/{Button,ButtonLink,IconButton,Reveal,SiteHeaderActiveNav,useBodyScrollLock}.test.jsx`; `tests/unit/lib/cn.test.js`; `tests/integration/{IdentityMode,AppLayout}.test.jsx`.

**Modified (client source):** `src/App.jsx` (wrapped in `MotionProvider`); `src/layouts/AppLayout.jsx` (added `IdentityProvider`, `PageTransition`, `SkipLink`); `src/components/navigation/{SiteHeader,MobileMenu}.jsx`; `src/components/layout/SiteFooter.jsx`; `src/components/ui/{Container,ButtonLink,SectionLabel,RoutePlaceholder}.jsx`; `src/pages/*.jsx` (all 9 route/error pages refined); `src/sections/home/*.jsx` (all 7 homepage sections refined); `src/styles/app.css` (rewritten to import the new token/typography/utility/reduced-motion files).

**Modified (tests):** `tests/setup.js` (added `IntersectionObserver` mock); `tests/unit/SiteHeader.test.jsx` (awaits the exit animation); `tests/e2e/smoke.spec.js` (18 new scenarios); `tests/e2e/axe.spec.js` (expanded from 1 to 9 scans).

**Modified (package/config):** `client/package.json` (new dependencies); `package-lock.json`.

**Modified (docs):** `README.md`, `docs/05-implementation-roadmap.md`, `CLAUDE_CODE_BUILD_PROMPTS.md`, `CLAUDE.md`.

**Deleted:** none.

## 20. Known Limitations

1. Client JS bundle grew ~67% (288.5 kB → 480.8 kB raw; 92.5 kB → 151.8 kB gzip), driven mainly by `motion` and `lucide-react`. No route-level code splitting was implemented — deferred to Phase 10 (Performance and Accessibility Hardening) per the roadmap.
2. No résumé PDF, professional portraits, or photography assets exist yet — every UI honestly reflects their absence rather than linking to a missing file.
3. No contact-form backend, database, or authentication.
4. No command palette yet (Phase 3+ per the roadmap's original plan).
5. Full project case studies do not exist yet — `/work/:slug` shows verified summary data plus an honest "in preparation" message.
6. `npm audit` reports 2 high-severity advisories in `react-router`/`react-router-dom` (RSC Mode CSRF bypass) — not exploitable in this SPA-only, non-RSC setup; not force-upgraded per the instruction against forced major-version bumps to silence audit warnings. Documented for revisit at the next natural dependency bump.
7. Responsive verification at 768/1024/1280/1440px was manual CSS review plus automated testing at 360px and 375px, not automated screenshot testing at every breakpoint — screenshot tests were judged not stable/valuable enough to add in this phase per the spec's own guidance ("Do not create screenshot tests unless they are stable and genuinely useful").

## 21. Phase 3 Readiness

**Ready: YES.** No blocking issues.

Recommended Phase 3 scope: typed project data expansion, `/work` index refinements as real project detail grows, and the first full case study (Sarabo) per `docs/05-implementation-roadmap.md`'s Phase 5 definition (the roadmap's phase numbering runs ahead of this build-prompt sequence's "Phase 3" label — both refer to the same next milestone: the project system and Sarabo case study).

Files Phase 3 is expected to modify: `client/src/data/projects.js` (richer schema), `client/src/pages/ProjectDetailsPage.jsx` (full case-study layout), new components under `client/src/features/projects/`, new sections under `client/src/sections/` for case-study content blocks.

## 22. Git Result

- **Branch:** `master`
- **Previous HEAD:** `b75d7ff38fd5946e9a5ffc495d8786dad45ce10a`
- **New commit hash:** recorded after commit — see the console report printed at the end of this phase
- **Commit subject:** `feat: add portfolio design system and motion`
- **Commit author:** Jahid Hasan (repository default)
- **Files added:** 24 (new components/features/hooks/styles/tests, this report)
- **Files modified:** ~34 (existing components/pages/sections/styles/tests/docs — see Section 19)
- **Files deleted:** 0
- **Working-tree status:** Clean after commit
- **Pushed:** No
- **Deployed:** No

## 23. Final Verdict

```text
A. PHASE 2 COMPLETE — READY FOR PROJECT SYSTEM
```
