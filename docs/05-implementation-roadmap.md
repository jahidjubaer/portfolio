# 05 — Implementation Roadmap

## 1. Delivery strategy

Build the portfolio in controlled vertical slices. Do not build all sections and then attempt accessibility, responsiveness, and performance at the end.

Every phase must end with:

- Working routes or components.
- Responsive behavior.
- Keyboard behavior.
- Reduced-motion behavior where relevant.
- Type checking.
- Linting.
- Tests appropriate to the phase.
- A production build.

---

## Phase 0 — Content and asset preparation

### Tasks

- Confirm professional title.
- Confirm availability statement.
- Confirm three featured projects.
- Collect repository and live links.
- Collect résumé PDF.
- Select professional portrait.
- Select one Beyond preview image.
- Select 12–30 photography images.
- Prepare short and long biography.
- Confirm leadership dates and outcomes.
- Confirm contact email and social profiles.

### Deliverables

- Completed `CONTENT_CHECKLIST.md`.
- `/content-source` folder or equivalent private working document.
- Optimized image source list.

### Definition of done

No public claim is invented. Missing content is marked explicitly.

---

## Phase 1 — Repository and framework foundation

### Tasks

- Initialize React Router Framework Mode project.
- Configure pnpm and Node engine.
- Configure TypeScript strict mode.
- Configure Tailwind CSS 4.
- Install approved packages only.
- Add ESLint and Prettier.
- Add Vitest and Playwright.
- Create route modules.
- Configure static pre-rendering.
- Add base error boundary and 404.
- Add CI workflow.

### Deliverables

- All routes render placeholder headings.
- Direct route loading works.
- `pnpm check` passes.

### Definition of done

The production build generates static output for every defined route.

---

## Phase 2 — Design tokens and UI primitives

### Tasks

- Implement SYSTEM and STORY token sets.
- Configure typography.
- Create spacing and layout utilities.
- Build `Button`, `LinkButton`, `IconButton`, `Tag`, `Surface`, `Container`, `SectionLabel`.
- Build focus-visible styling.
- Add skip link.
- Add reduced-motion stylesheet.
- Create Storybook only if genuinely useful; not required for MVP.

### Deliverables

- Internal design-system page in development only, or test route removed before launch.
- Primitive component tests.

### Definition of done

All primitives work across both identity modes, keyboard interaction, and mobile widths.

---

## Phase 3 — Application shell and navigation

### Tasks

- Build `SiteHeader`.
- Build desktop navigation.
- Build accessible mobile drawer.
- Build footer.
- Build command palette.
- Implement route focus management.
- Implement scroll restoration.
- Implement identity mode store and route relationship.
- Add basic page transitions.

### Deliverables

- Fully navigable empty site shell.
- Command palette actions.
- Keyboard test coverage.

### Definition of done

A keyboard-only user can reach every route, open/close overlays, and identify focus at all times.

---

## Phase 4 — Home experience

### Tasks

- Build hero content and layout.
- Build technical status panel.
- Build proof strip.
- Build featured project dossiers.
- Build engineering principles.
- Build capability map.
- Build journey snapshot.
- Build Beyond portal.
- Build contact CTA.
- Add signature hero animation.

### Deliverables

- Complete home route.
- Mobile, tablet, desktop layouts.
- Reduced-motion version.
- Home Playwright smoke test.

### Definition of done

A recruiter can understand the portfolio's role, evidence, and contact path within 30 seconds.

---

## Phase 5 — Work index and case-study system

### Tasks

- Create typed project data.
- Build project lookup and route loader.
- Build Work index.
- Build reusable case-study sections.
- Implement Sarabo case study.
- Implement second detailed case study.
- Add live/repository link validation states.
- Add next-project navigation.
- Add architecture-diagram component.

### Deliverables

- `/work`.
- At least two complete `/work/:slug` routes.
- Dynamic paths pre-rendered.
- Project data tests.

### Definition of done

Each featured case study explains problem, role, approach, decisions, challenge, result, and reflection.

---

## Phase 6 — About and professional evidence

### Tasks

- Build biography section.
- Build engineering principles.
- Build full capability map.
- Build timeline.
- Add education.
- Add 250+ problem-solving evidence and verified profile links.
- Add leadership summary.
- Build résumé summary and download route.

### Deliverables

- `/about`.
- `/resume`.

### Definition of done

No skill is represented by an arbitrary percentage. Every major claim has evidence or an honest “learning” label.

---

## Phase 7 — Beyond the Code

### Tasks

- Build STORY hero.
- Implement full palette and layout transition.
- Build photo contact sheet.
- Add category filtering if useful.
- Add accessible lightbox.
- Add sports, leadership, and volunteering stories.
- Optimize responsive photography assets.
- Add return-to-SYSTEM action.

### Deliverables

- `/beyond`.
- Photography data and lightbox.
- Keyboard and reduced-motion tests.

### Definition of done

The personal route feels visually distinct but remains clearly part of the same brand and application.

---

## Phase 8 — Contact and conversion

### Tasks

- Confirm form provider.
- Implement schema and form.
- Add honeypot and optional CAPTCHA.
- Add inline pending/success/error feedback.
- Add React Hot Toast as supplemental feedback.
- Add email copy action.
- Add public social links.
- Test error and success paths.

### Deliverables

- `/contact`.
- Production-connected form.

### Definition of done

A real production submission succeeds, arrives at the correct destination, and provides accessible confirmation.

---

## Phase 9 — SEO, metadata, and structured data

### Tasks

- Unique metadata per route.
- Canonicals.
- Open Graph images.
- Person JSON-LD.
- Project structured data where appropriate.
- Sitemap.
- Robots.
- Favicons.
- Social-preview test.
- Noindex preview deployments when available.

### Deliverables

- Complete discoverability layer.

### Definition of done

Every route has a correct title, description, canonical, share image, and crawl behavior.

---

## Phase 10 — Performance and accessibility hardening

### Tasks

- Optimize images.
- Audit route bundles.
- Lazy-load lightbox, GSAP scenes, and Story assets.
- Remove unused packages.
- Test Core Web Vitals locally and in preview.
- Run Axe.
- Perform manual keyboard test.
- Test reduced motion.
- Test zoom at 200%.
- Test screen-reader labels.
- Test direct routes and browser history.

### Deliverables

- Audit report.
- Resolved critical issues.

### Definition of done

Meets quality thresholds in the master specification or has documented, justified exceptions.

---

## Phase 11 — Deployment and launch

### Tasks

- Connect repository to hosting.
- Configure domain.
- Configure redirects/fallback.
- Configure headers.
- Configure production environment variables.
- Test form.
- Test analytics.
- Run production smoke test.
- Validate all links.
- Confirm résumé.
- Submit sitemap.

### Deliverables

- Production URL.
- Launch checklist.
- Rollback plan.

### Definition of done

Production is stable, secure, crawlable, responsive, and free of console errors.

---

## 2. MVP vs post-launch scope

### MVP

- Home.
- Work index.
- Two project case studies.
- About.
- Beyond.
- Contact.
- Résumé.
- 404.
- Command palette.
- SYSTEM/STORY identity.
- Strong motion and reduced motion.
- SEO and tests.

### V1.1

- Third complete case study.
- Dedicated photography route.
- More personal stories.
- Case-study video previews.
- Improved analytics.

### V2

- Notes/blog using MDX.
- Search across projects and notes.
- Build-time GitHub data sync.
- CMS only when local content becomes difficult to manage.
- Optional WebGL experiment with static fallback.

---

## 3. Issue labels for project management

Suggested labels:

- `foundation`
- `design-system`
- `navigation`
- `content`
- `project-case-study`
- `animation`
- `accessibility`
- `performance`
- `seo`
- `testing`
- `deployment`
- `blocked-content`
- `polish`

---

## 4. Pull-request rules

Each PR should:

- Solve one coherent slice.
- Include screenshots or video for visual changes.
- State accessibility behavior.
- State reduced-motion behavior.
- State responsive checks.
- Pass `pnpm check`.
- Avoid unrelated formatting changes.
- Update documentation when architecture or scope changes.

---

## 5. Final launch checklist

### Content

- [ ] Name, title, and biography approved.
- [ ] Featured projects approved.
- [ ] All claims verified.
- [ ] Résumé current.
- [ ] Links working.
- [ ] Photography permission confirmed.

### Product

- [ ] Primary recruiter path works.
- [ ] Beyond path is visible but secondary.
- [ ] Calls to action are clear.
- [ ] 404 recovery works.

### Accessibility

- [ ] Keyboard-only test complete.
- [ ] Reduced-motion test complete.
- [ ] Focus visible everywhere.
- [ ] Modal/drawer focus management correct.
- [ ] Alt text reviewed.
- [ ] Form errors announced.

### Performance

- [ ] Images optimized.
- [ ] Initial bundles audited.
- [ ] No unnecessary WebGL/video.
- [ ] Core Web Vitals targets checked.
- [ ] No major layout shift.

### Technical

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Unit tests pass.
- [ ] End-to-end smoke tests pass.
- [ ] Production build passes.
- [ ] Direct routes work.
- [ ] Console clean.

### SEO and deployment

- [ ] Canonical domain.
- [ ] Metadata unique.
- [ ] OG images correct.
- [ ] Sitemap valid.
- [ ] Robots correct.
- [ ] HTTPS active.
- [ ] Contact form production-tested.

## Implementation Progress

- **Phase 0:** Complete. Audit report: `docs/audits/phase-0-audit-report.md`.
- **Original Phase 1 (superseded):** Completed 2026-08-05, then superseded the same day due to an architecture misunderstanding. Report retained for history: `docs/audits/phase-1-foundation-report.md`.
  - **What it built:** Dedicated Git repository isolated inside `portfolio/`; pnpm enabled via Corepack; React Router 8 Framework Mode app scaffolded (React 19.2, TypeScript strict, Tailwind CSS 4, `ssr: false` with static pre-rendering); full folder structure under `app/`, `public/`, and `tests/`; all seven required routes; ESLint, Prettier, Vitest + Testing Library, and Playwright + Axe configured; GitHub Actions CI workflow (lint, typecheck, unit tests, build, Playwright). Validated clean at the time (`pnpm check`/`check:full` passing, 7/7 unit tests, 9/9 Playwright tests, zero Axe violations).
  - **Why superseded:** The approved architecture is a plain React SPA client plus a separate Express.js API server in a pnpm workspace, JavaScript only — not React Router Framework Mode with TypeScript. See `docs/audits/phase-1-architecture-correction-report.md`.
- **Phase 1 Correction (pnpm-based, superseded):** Completed 2026-08-05, then superseded the same day when the approved package manager was corrected from pnpm to npm. Report retained for history: `docs/audits/phase-1-architecture-correction-report.md`.
  - **What it built:** Removed `app/`, all TypeScript config/deps, and all React Router Framework Mode deps. Created a **pnpm** workspace with `client/` (Vite + React 19 + `react-router-dom`, Tailwind CSS 4, JavaScript only) and `server/` (Express, ES modules, `GET /api/health`, JSON 404 for unknown `/api/*` routes, centralized error handling, Helmet/CORS/dotenv). All seven required client routes recreated as plain JSX placeholder pages with `createBrowserRouter`. ESLint/Prettier reconfigured for JS/JSX (no TS parser); Vitest + Testing Library + jsdom for client unit/integration tests; Vitest + Supertest for server tests; Playwright retained for client e2e. CI workflow corrected: `typecheck` step removed, `test:client`/`test:server` steps added.
  - **Why superseded:** The user's explicit stack decision requires npm, not pnpm. See `docs/audits/phase-1-stack-correction-and-visible-foundation-report.md`.
- **Phase 1 Stack Correction + Visible Foundation:** Complete. Date completed: 2026-08-05.
  - **Main deliverables:** Migrated the workspace from pnpm to **npm workspaces** (one root `package-lock.json`, root `workspaces` field, no lockfiles inside `client/`/`server/`). Renamed server files to the approved naming (`healthRoutes.js`, `healthController.js`, `notFound.js`, `errorHandler.js`). Replaced every placeholder page with real, verified-content pages: a full homepage (hero, credibility strip, featured projects, capabilities, journey, Beyond portal, contact CTA), a working `/work` project grid, a content-complete `/about`, an honest `/beyond` (photography/sports/leadership, gallery still in preparation), `/contact` (email/GitHub/LinkedIn/location, no form yet), and `/resume` (honest "PDF in preparation" state, no dead link). Built a real application shell (`AppLayout` with `<Outlet />`, `SiteHeader` with a functional keyboard- and Escape-accessible mobile menu, `SiteFooter`) and a first Tailwind CSS 4 design foundation (dark SYSTEM tokens, signal-lime accent, visible focus states). All content sourced from `CONTENT_CHECKLIST.md`; nothing invented.
  - **Validation results:** see `docs/audits/phase-1-stack-correction-and-visible-foundation-report.md` for the full command-by-command results table.
  - **Known limitations:** No database, contact-form API, or authentication yet (not needed for this phase). No deployment or remote CI execution. No résumé PDF, professional portraits, or photography assets yet (per `CONTENT_CHECKLIST.md`). Full case studies, the command palette, and the STORY visual identity are not built yet.
  - **Next phase:** Phase 2 — Complete design system, motion, and application shell refinement.
- **Phase 2 — Design System and Motion Foundation:** Complete. Date completed: 2026-08-05.
  - **Main deliverables:** Full SYSTEM and STORY design-token system (`client/src/styles/tokens.css`) plus a typography scale, spacing/container/motion/z-index tokens, and a `reduced-motion.css` backstop. `cn()` utility (clsx + tailwind-merge) with tests. Fourteen UI primitives under `client/src/components/ui/` (Button, ButtonLink, IconButton, Container, Section, SectionHeader, SectionLabel, Surface, Tag, TextLink, Divider, StatusIndicator, VisuallyHidden, SkipLink). Route-driven identity-mode system (`client/src/features/identity-mode/`) — SYSTEM by default, STORY automatically on `/beyond`, applied via `data-identity` on the document root with no navigation flash. Motion architecture (`client/src/features/motion/`) built on `motion/react` — page transitions, section reveals (`Reveal`), staggered lists (`StaggerGroup`), the header's sliding active-nav indicator, and an animated, keyboard-accessible mobile menu with focus trap and body-scroll lock, all respecting `prefers-reduced-motion` via `MotionConfig reducedMotion="user"`. Refined the entire homepage (hero, credibility rail, dossier-style featured projects, capability clusters, indexed journey, STORY-tinted Beyond portal, contact CTA) and every route (`/work`, `/work/:slug`, `/about`, `/beyond`, `/contact`, `/resume`, 404) with the new visual system, while preserving all verified content.
  - **Dependencies added:** `motion`, `lucide-react`, `clsx`, `tailwind-merge` (client only). daisyUI was evaluated and deliberately not installed — no Phase 2 UI needed its behavioral foundations.
  - **Validation results:** see `docs/audits/phase-2-design-system-motion-report.md` for the full command-by-command results table — 38 client unit/integration tests, 6 server tests, and 33 Playwright e2e tests (including 9 Axe scans across every route, the open mobile menu, and an unknown route) all pass with zero Axe violations.
  - **Known limitations:** Client JS bundle grew from ~289 kB to ~481 kB (gzip ~92 kB → ~152 kB), driven mainly by `motion` and `lucide-react` — documented, not yet optimized (route-level code splitting is a Phase 10 concern). No database, contact-form API, or authentication. No résumé PDF or photography assets yet. Command palette and full case studies are not built yet.
  - **Next phase:** Phase 3 — Project System and Sarabo Case Study.
- **Phase 3 — Project System and Sarabo Case Study:** Complete. Date completed: 2026-08-06.
  - **Main deliverables:** Refactored `client/src/data/projects.js` into a richer, validated project model (type, status, featured state, links, optional case study, related slugs, SEO, missing-content tracking) with a custom validator (`client/src/data/project-schema.js`, throws in dev/test, logs-and-continues in production) and pure selectors (`client/src/features/projects/project-selectors.js`). Built 13 reusable project components (`ProjectCard`, `FeaturedProjectDossier`, `ProjectStatus`, `ProjectStack`, `ProjectLinks`, `ProjectHero`, `ProjectMetaGrid`, `ProjectSection`, `ProjectSectionNav`, `ProjectArchitecture`, `ProjectWorkflow`, `RelatedProjects`, `CaseStudyUnavailable`). Delivered the first complete case study — Sarabo — at `/work/sarabo` (overview, roles, workflow, capabilities, architecture, engineering decisions, and a restrained note in place of unverified challenge/outcome/reflection content), with anchor-based section navigation. Refined `/work` to distinguish full case studies from in-preparation projects (Sarabo leads; Bang Learner and Note Bank show an honest preparation state), and wired the homepage featured-projects section to the same central data source (no duplicate arrays).
  - **Dependencies added:** none.
  - **Validation results:** see `docs/audits/phase-3-project-system-sarabo-report.md` — 86 client unit/integration tests (+48 from Phase 2), 6 server tests, and 39 Playwright e2e tests (including 11 Axe scans across every route plus `/work/sarabo`, `/work/bang-learner`, and `/work/unknown-project`) all pass with zero Axe violations. Client JS gzip 151.76 kB → 155.99 kB (+4.23 kB), CSS gzip 5.71 kB → 5.91 kB (+0.20 kB) — no new dependency.
  - **Known limitations:** Sarabo's exact role, timeline, repositories, current status, challenges, outcome, and visual assets remain `TODO_CONTENT` per `CONTENT_CHECKLIST.md` and are honestly omitted from the live UI. Bang Learner and Note Bank remain in-preparation (no full case study). No archive-tier projects exist yet — none of the candidate archive projects in `CONTENT_CHECKLIST.md` have confirmed presentation readiness.
  - **Next phase:** Prompt 6 — review and recommend the second and third featured projects (Bang Learner / Note Bank evidence), per `CLAUDE_CODE_BUILD_PROMPTS.md`; implementation waits for that recommendation to be approved.
- **Phase 3.1 — Sarabo Content Review (review-only, no commit-worthy source change):** Complete. Date completed: 2026-08-06.
  - **What it did:** Classified every rendered Sarabo claim as VERIFIED, SUPPORTED INFERENCE, USER CONFIRMATION REQUIRED, or OMIT. Found no invented content. Flagged two cautious-wording candidates for user approval: the workflow section's implied step ordering/gating language, and the "Engineering decisions" heading (recommended rename to "Implementation approach"). Confirmed featured-project order and presentation levels (Sarabo flagship; Bang Learner/Note Bank as honest cards) as already correct. Produced a 10-question user questionnaire.
  - **Report:** `docs/reviews/phase-3-1-sarabo-content-review.md`. Commit: `29ca8a9` (`docs: review sarabo case study content`).
  - **Next phase:** Phase 3.2 — apply user answers to finalize Sarabo wording.
- **Phase 3.2 — Finalize Sarabo Content:** Complete. Date completed: 2026-08-06.
  - **Main deliverables:** Applied user-confirmed facts (Role: Sole Developer; Team: Solo project; Timeline: July–August; Responsibility: end-to-end development; Primary challenge: Validation, solution still `TODO_CONTENT`) to `client/src/data/projects.js`. Replaced the six-step sequenced workflow diagram with the review's recommended single-paragraph, cautious lifecycle description. Renamed the "Engineering decisions" section to "Implementation approach" and trimmed Decision 1's unsupported rationale clause, per the Phase 3.1 review. Added restrained, non-fabricated challenge/outcome/reflection content (no invented metrics or solution). Added optional Role/Timeline fields to `ProjectMetaGrid` and a responsibility line under Overview. `ProjectDetailsPage.jsx`'s Workflow section now renders a paragraph for string-based workflows (Sarabo) while still supporting the original step-list shape for any future project.
  - **Validation results:** see `docs/audits/phase-3-2-sarabo-content-finalization-report.md` — 88 client tests (+2 from Phase 3), 6 server tests, 39 Playwright e2e tests, all pass with zero Axe violations. JS gzip 155.99 kB → 156.20 kB (+0.21 kB), CSS gzip unchanged at 5.91 kB. No new dependencies.
  - **Known limitations:** Sarabo's client/server repository URLs, public documentation URL, current-status detail, the validation challenge's actual solution, cover image, and screenshots remain `TODO_CONTENT`, honestly omitted from the public UI.
  - **Next phase:** Phase 4 — Bang Learner Review and Project Archive.
