# Claude Code Build Prompts

Use these prompts in order. Run one phase at a time and review the output before continuing.

---

## Prompt 0 — Audit and plan

```text
Read CLAUDE.md and every file in /docs. Inspect the repository without changing files. Report:
1. Current project state and stack.
2. Conflicts with the documented architecture.
3. Missing content/assets that block implementation.
4. Proposed file structure.
5. A phase-by-phase implementation plan.
6. Packages already installed, packages required, and packages that should not be added.
Do not write code yet.
```

---

## Prompt 1 — Initialize foundation

```text
Implement Phase 1 from docs/05-implementation-roadmap.md.
Use React Router Framework Mode, TypeScript strict, Tailwind CSS 4, pnpm, and static pre-rendering. Create all documented routes with semantic placeholder pages, root error handling, 404 behavior, testing setup, and CI. Do not implement the visual design yet.
Run lint, typecheck, unit tests, and production build. Report exact results and remaining TODO_CONTENT items.
```

---

## Prompt 2 — Design system

```text
Implement Phase 2. Build the SYSTEM and STORY design tokens, typography, base CSS, reduced-motion baseline, layout utilities, and documented UI primitives. Add a development-only design-system route or fixture, but ensure it is not included in production navigation and can be removed cleanly.
Do not use default daisyUI styling for the visible design. Add component tests and run all checks.
```

---

## Prompt 3 — Navigation and shell

```text
Implement Phase 3. Build the accessible site header, desktop navigation, mobile drawer, footer, skip link, command palette, route focus management, scroll restoration, identity-mode infrastructure, and basic route transitions.
All functionality must work by keyboard and in reduced-motion mode. Add Playwright tests for navigation, drawer, command palette, browser back/forward, and direct route loads. Run all checks.
```

---

## Prompt 4 — Home route

```text
Implement Phase 4 using the SYSTEM / STORY art direction. Build the home hero, proof strip, featured project dossiers, engineering approach, capability map, journey snapshot, Beyond portal, and contact CTA.
Use verified local content only. Mark unknown fields as TODO_CONTENT. Use Motion for normal animation. Use GSAP only if the hero genuinely requires a timeline that Motion cannot express cleanly, and explain that decision before installing or using it.
Deliver responsive and reduced-motion versions. Run all checks and include production screenshots for mobile and desktop if the environment supports them.
```

---

## Prompt 5 — Project system and Sarabo case study

```text
Implement Phase 5. Create typed project data, Work index, dynamic project detail route, reusable case-study sections, and static pre-render paths. Implement Sarabo as the first flagship case study using only verified information from the provided content/repositories.
Include problem, users, role, workflows, architecture, decisions, challenges, result, learning, next steps, gallery placeholders, and links. Do not invent metrics. Add unit, integration, and direct-route tests. Run all checks.
```

---

## Prompt 6 — Second and third projects

```text
Review available project repositories, live links, screenshots, and content. Recommend the strongest second and third featured projects based on technical depth, completeness, relevance to frontend roles, and presentation quality.
Do not implement until the recommendation is stated. Then implement the approved project data and at least one additional complete case study. Keep weaker projects in a compact archive rather than overstating them. Run all checks.
```

---

## Prompt 7 — About and résumé

```text
Implement Phase 6. Build the About and Résumé routes with verified biography, principles, capabilities, learning direction, education, problem-solving evidence, timeline, and leadership summary. Do not use percentage skill bars. Clearly distinguish current skills, skills under development, and AI/ML exploration.
Add PDF download behavior using the confirmed asset. Add route metadata, tests, and run all checks.
```

---

## Prompt 8 — Beyond the Code

```text
Implement Phase 7. Build the STORY identity and /beyond route with photography contact sheet, accessible lightbox, category filtering only if useful, sports, leadership, volunteering, and return-to-SYSTEM interaction.
Route-split photography and lightbox code. Optimize images and preserve aspect ratios. No autoplay slideshow. Ensure keyboard, focus, mobile, and reduced-motion behavior. Run all checks.
```

---

## Prompt 9 — Contact

```text
Implement Phase 8 with React Hook Form, Zod, the approved single form provider, honeypot, inline accessible status, error recovery, and React Hot Toast as supplemental feedback. Add email-copy action and verified social links.
Never expose private secrets. Add success/error mocks and Playwright tests. Run all checks, but do not claim the production form works until a real production submission is tested.
```

---

## Prompt 10 — SEO and structured data

```text
Implement Phase 9. Add unique route metadata, canonical URLs, Open Graph data, social images, Person structured data, project structured data where appropriate, sitemap, robots, favicons, and preview-deployment noindex configuration where supported.
Use the final confirmed domain. Validate generated static HTML and direct route metadata. Run all checks.
```

---

## Prompt 11 — Quality hardening

```text
Implement Phase 10. Audit accessibility, reduced motion, keyboard use, route behavior, responsive layouts, animation cleanup, images, bundles, Core Web Vitals risks, console output, and broken links.
Run Axe, Playwright, Lighthouse if available, bundle analysis if configured, and a production build. Fix critical and serious issues. Produce a final audit table showing target, measured result, status, and unresolved exception.
```

---

## Prompt 12 — Deployment preparation

```text
Prepare Phase 11 without deploying until approved. Add hosting configuration, static route fallback, production environment documentation, security headers, domain/canonical configuration points, CI deployment checks, and a complete launch checklist.
State exactly what will happen during deployment and which external services or settings are required. Do not publish or change DNS without explicit approval.
```

---

## Prompt for later content update

```text
Update portfolio content only. Do not change the design system or architecture unless the new content requires it. Validate claims, links, images, route metadata, project order, and résumé date. Run typecheck, tests, and build. Report any broken or unverifiable content.
```

---

## Prompt for design polish

```text
Audit the current implementation against docs/01-master-product-design-spec.md and docs/04-animation-accessibility-performance.md. Identify the ten highest-impact visual or interaction improvements. Prioritize hierarchy, spacing, typography, image treatment, focus behavior, motion consistency, and mobile quality—not additional effects. Implement only the approved improvements and preserve performance budgets.
```

---

## Execution History

### Phase 0 — Audit and plan

- **Date:** 2026-08-05
- **Status:** Complete
- **Report path:** `docs/audits/phase-0-audit-report.md`
- **Commit hash:** N/A (read-only audit, no commit)
- **Next phase:** Phase 1

### Phase 1 — Initialize foundation (superseded)

- **Date:** 2026-08-05
- **Status:** Complete, then superseded the same day
- **Report path:** `docs/audits/phase-1-foundation-report.md`
- **Commit hash:** See report Section 18 (Git Result)
- **Note:** This phase used React Router Framework Mode with TypeScript and static pre-rendering. That direction was based on a misreading of the approved architecture and was fully replaced by the Phase 1 Correction below. The report and commit are retained for history, not as the current state of the repository.

### Phase 1 Correction — Migrate to React JavaScript + Node.js + Express.js (superseded)

- **Date:** 2026-08-05
- **Status:** Complete, then superseded the same day
- **Summary:** Previous Phase 1 used the wrong architecture (React Router Framework Mode, TypeScript, static framework prerendering). It was corrected to a plain React SPA client (`client/`, JavaScript, Vite, `react-router-dom`) plus a separate Express.js API server (`server/`), in a **pnpm** workspace. TypeScript and React Router Framework Mode were fully removed — zero `.ts`/`.tsx` project files remain.
- **Note:** The package-manager choice (pnpm) was itself corrected the same day to npm — see the Phase 1 Stack Correction entry below. The report and commit are retained for history.
- **Report path:** `docs/audits/phase-1-architecture-correction-report.md`
- **Commit hash:** See report Section 16 (Git Result)

### Phase 1 Stack Correction + Visible Foundation — Migrate pnpm to npm, build real homepage

- **Date:** 2026-08-05
- **Status:** Complete
- **Summary:** Migrated the workspace's package manager from pnpm to npm workspaces (single root `package-lock.json`). Replaced every placeholder page with real, verified-content pages — homepage (hero, credibility strip, featured projects, capabilities, journey, Beyond portal, contact CTA), `/work`, `/about`, `/beyond`, `/contact`, `/resume` — plus a working application shell (header with functional mobile menu, footer) and a first Tailwind CSS 4 design foundation. All content sourced from `CONTENT_CHECKLIST.md`; nothing invented.
- **Report path:** `docs/audits/phase-1-stack-correction-and-visible-foundation-report.md`
- **Commit hash:** See report Section 20 (Git Result)
- **Next phase:** Phase 2 — Complete design system, motion, and application shell refinement

### Phase 2 — Design System, Motion Foundation and UI Refinement

- **Date:** 2026-08-05
- **Status:** Complete
- **Summary:** Built the SYSTEM/STORY design-token system, a typography scale, 14 reusable UI primitives, a route-driven identity-mode system (SYSTEM by default, STORY automatically on `/beyond`, no navigation flash), and a Motion-based (`motion/react`) animation foundation — page transitions, section reveals, staggered lists, the header's active-nav indicator, and an accessible animated mobile menu — all respecting `prefers-reduced-motion`. Refined the entire homepage and every route with the new visual system while preserving all verified content. Added `motion`, `lucide-react`, `clsx`, `tailwind-merge`; evaluated and deliberately skipped daisyUI (no concrete need). 38 client tests, 6 server tests, and 33 Playwright e2e tests (9 Axe scans, zero violations) all pass.
- **Report path:** `docs/audits/phase-2-design-system-motion-report.md`
- **Commit hash:** See report Section 22 (Git Result)
- **Next phase:** Phase 3 — Project System and Sarabo Case Study

### Phase 3 — Project System and Sarabo Case Study

- **Date:** 2026-08-06
- **Status:** Complete
- **Summary:** Refactored the project data model (`client/src/data/projects.js`) with a custom validator (`project-schema.js`) and pure selectors (`features/projects/project-selectors.js`). Built 13 reusable project components and delivered the first complete case study — Sarabo, at `/work/sarabo` — with overview, roles, workflow, capabilities, architecture, engineering decisions, anchor-based section navigation, and a restrained note in place of unverified challenge/outcome/reflection content. Refined `/work` and the homepage to derive entirely from the central data source, distinguishing the complete case study from Bang Learner/Note Bank's honest in-preparation state. No new dependencies.
- **Report path:** `docs/audits/phase-3-project-system-sarabo-report.md`
- **Commit hash:** See report Section 20 (Git Result)
- **Next phase:** Prompt 6 — review and recommend the second and third featured projects

### Phase 3.1 — Sarabo Content Review and Featured Project Freeze

- **Date:** 2026-08-06
- **Status:** Complete (review only, no production source changed)
- **Summary:** Reviewed every Sarabo case-study claim against `CONTENT_CHECKLIST.md` §7 and classified each as verified, supported inference, user-confirmation-required, or omit. Found no invented content. Flagged two cautious-wording candidates for user approval — the workflow section's inferred step ordering, and the "Engineering decisions" heading/framing, which implies deliberate rationale not documented (recommended rename to "Implementation approach") — neither judged unsafe enough to change without approval. Confirmed the current featured-project order (Sarabo flagship, Bang Learner and Note Bank as honest project cards) and archive-empty state are already correct; no promotion or demotion recommended. Produced a 10-question user questionnaire for the remaining high-value facts (role, timeline, challenges, outcome, repos, screenshots).
- **Report path:** `docs/reviews/phase-3-1-sarabo-content-review.md`
- **Commit hash:** See review report Section 15 / console report
- **Next phase:** Await user answers to the questionnaire, then a small wording-and-content-expansion pass on Sarabo
