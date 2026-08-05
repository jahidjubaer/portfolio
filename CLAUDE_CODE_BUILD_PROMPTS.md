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

### Phase 1 — Initialize foundation

- **Date:** 2026-08-05
- **Status:** Complete
- **Report path:** `docs/audits/phase-1-foundation-report.md`
- **Commit hash:** See report Section 18 (Git Result)
- **Next phase:** Phase 2 — Design system
