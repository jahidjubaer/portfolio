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
- **Phase 1 Correction:** Complete. Date completed: 2026-08-05.
  - **Main deliverables:** Removed `app/`, all TypeScript config/deps, and all React Router Framework Mode deps. Created a pnpm workspace with `client/` (Vite + React 19 + `react-router-dom`, Tailwind CSS 4, JavaScript only) and `server/` (Express, ES modules, `GET /api/health`, JSON 404 for unknown `/api/*` routes, centralized error handling, Helmet/CORS/dotenv). All seven required client routes recreated as plain JSX pages with `createBrowserRouter`. ESLint/Prettier reconfigured for JS/JSX (no TS parser); Vitest + Testing Library + jsdom for client unit/integration tests; Vitest + Supertest for server tests; Playwright retained for client e2e. CI workflow corrected: `typecheck` step removed, `test:client`/`test:server` steps added.
  - **Validation results:** see `docs/audits/phase-1-architecture-correction-report.md` for the full command-by-command results table.
  - **Known limitations:** No database, contact-form API, or authentication yet (not needed for this phase). No deployment or remote CI execution. Portfolio content remains placeholder-only. No visual design system yet.
  - **Next phase:** Phase 2 — Design tokens and UI primitives.
