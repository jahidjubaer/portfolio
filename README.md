# Jahid Hasan Portfolio Documentation Suite

**Status:** Version 1.0 — implementation-ready foundation  
**Prepared for:** Jahid Hasan  
**Primary implementation tool:** Claude Code  
**Baseline date:** 5 August 2026

This package defines the product, visual system, information architecture, technical architecture, animation rules, quality standards, content requirements, and build sequence for Jahid Hasan's portfolio.

## Core concept

The portfolio is a **dual-identity digital experience**:

- **SYSTEM** — the default professional experience for recruiters, engineering teams, collaborators, and clients.
- **STORY** — an intentional “beyond the code” experience for photography, leadership, sports, volunteering, and personal interests.

The site must feel authored, precise, modern, and technically credible. It must not look like a purchased template, a fake terminal, or a generic purple-gradient developer portfolio.

## Documents

1. [`docs/01-master-product-design-spec.md`](docs/01-master-product-design-spec.md) — product vision, reference audit, brand direction, design concept, page specifications, and acceptance criteria.
2. [`docs/02-information-architecture-content.md`](docs/02-information-architecture-content.md) — routes, navigation, content hierarchy, page copy direction, and typed content models.
3. [`docs/03-technical-architecture.md`](docs/03-technical-architecture.md) — stack, dependencies, React Router architecture, folder structure, SEO, forms, security, tests, and deployment.
4. [`docs/04-animation-accessibility-performance.md`](docs/04-animation-accessibility-performance.md) — motion language, animation ownership rules, accessibility, performance budgets, and reduced-motion behavior.
5. [`docs/05-implementation-roadmap.md`](docs/05-implementation-roadmap.md) — build phases, task order, deliverables, and definition of done.
6. [`CLAUDE.md`](CLAUDE.md) — persistent project instructions for Claude Code. Place this file at the repository root.
7. [`CLAUDE_CODE_BUILD_PROMPTS.md`](CLAUDE_CODE_BUILD_PROMPTS.md) — phase-by-phase prompts to use with Claude Code.
8. [`CONTENT_CHECKLIST.md`](CONTENT_CHECKLIST.md) — assets and personal information still required before final launch.

## Recommended workflow

1. Create a new repository.
2. Copy this entire documentation package into the repository.
3. Keep `CLAUDE.md` at the repository root.
4. Put the other documents inside `/docs` or preserve the current paths.
5. Complete the critical items in `CONTENT_CHECKLIST.md`.
6. Run the Claude Code prompts in order. Do not ask Claude Code to build the entire portfolio in one uncontrolled pass.

## Positioning rule

The primary positioning is:

> **Frontend Developer and Junior Software Engineer**

Full-stack and AI/ML must be represented as active growth directions, not as senior-level claims:

> React-focused engineer expanding into full-stack systems and AI-enabled products.

## Important design rule

“Stand out” means strong art direction, content hierarchy, motion quality, case-study depth, and technical polish. It does **not** mean adding every effect, package, gradient, 3D object, or animation available.

## Implementation Status

- **Current completed phase:** Phase 3 — Project System and Sarabo Case Study. Adds a validated project data model, reusable case-study components, and the first complete case study (Sarabo) on top of the Phase 2 design system and motion foundation.
- **Current stack status:** React 19, Vite, React Router DOM (client-side), Tailwind CSS 4, JavaScript only (no TypeScript), Node.js + Express.js, **npm workspaces** (`client` + `server`, one root `package-lock.json`), Node ≥20 (CI runs Node 22). No new dependencies added this phase. daisyUI, GSAP, Lenis, React Hot Toast, React Hook Form, Zod, and cmdk remain uninstalled — no concrete feature has justified them yet.
- **Design system status:** SYSTEM and STORY token sets (`client/src/styles/tokens.css`), typography scale, spacing/motion/z-index tokens, and 14 reusable UI primitives (Button, ButtonLink, IconButton, Container, Section, SectionHeader, SectionLabel, Surface, Tag, TextLink, Divider, StatusIndicator, VisuallyHidden, SkipLink).
- **Identity-mode status:** SYSTEM is default; `/beyond` automatically switches the document root to STORY via `data-identity`, updating on every client-side navigation with no flash.
- **Motion status:** Page transitions, section reveals, staggered lists, the active-nav pill, and the mobile-menu transition all run through `motion/react`; `MotionConfig reducedMotion="user"` makes every animation honor `prefers-reduced-motion` automatically.
- **Project system status:** `client/src/data/projects.js` (validated by `client/src/data/project-schema.js`) is the single source of truth for `/work`, `/work/:slug`, and the homepage featured-projects section. Sarabo (`/work/sarabo`) is the first complete case study; Bang Learner and Note Bank show an honest in-preparation state pending verified evidence.
- **Testing status:** 86 client unit/integration tests, 6 server tests, and 39 Playwright e2e tests (including 11 Axe accessibility scans across every route plus `/work/sarabo`, `/work/bang-learner`, and `/work/unknown-project`) — all passing with zero Axe violations.
- **Next planned phase:** Prompt 6 — review and recommend the second and third featured projects (see `CLAUDE_CODE_BUILD_PROMPTS.md`).
- **Phase 3 report:** [`docs/audits/phase-3-project-system-sarabo-report.md`](docs/audits/phase-3-project-system-sarabo-report.md).
- **Earlier reports:** [`docs/audits/phase-2-design-system-motion-report.md`](docs/audits/phase-2-design-system-motion-report.md), [`docs/audits/phase-1-stack-correction-and-visible-foundation-report.md`](docs/audits/phase-1-stack-correction-and-visible-foundation-report.md), [`docs/audits/phase-1-architecture-correction-report.md`](docs/audits/phase-1-architecture-correction-report.md), [`docs/audits/phase-1-foundation-report.md`](docs/audits/phase-1-foundation-report.md).