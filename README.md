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

- **Current completed phase:** Phase 1 Correction — Architecture migration to a plain React SPA client (`client/`) plus a separate Express.js API server (`server/`), in a pnpm workspace. This supersedes the original Phase 1, which incorrectly used React Router Framework Mode and TypeScript.
- **Current stack status:** React 19, Vite, React Router DOM (client-side), Tailwind CSS 4, JavaScript only (no TypeScript), Node.js + Express.js, pnpm workspace (`client` + `server`), Node ≥22. All approved Phase 1 dev tooling installed (ESLint, Prettier, Vitest, Testing Library, Supertest, Playwright + Axe). All Phase 2+ packages (daisyUI, Motion, GSAP, Lenis, React Hot Toast, React Hook Form, Zod, Lucide React, cmdk, etc.) remain uninstalled as planned.
- **Validation status:** see `docs/audits/phase-1-architecture-correction-report.md` for exact command-by-command results.
- **Next planned phase:** Phase 2 — Design tokens and UI primitives.
- **Architecture correction report:** [`docs/audits/phase-1-architecture-correction-report.md`](docs/audits/phase-1-architecture-correction-report.md).
- **Original Phase 1 report (superseded):** [`docs/audits/phase-1-foundation-report.md`](docs/audits/phase-1-foundation-report.md).