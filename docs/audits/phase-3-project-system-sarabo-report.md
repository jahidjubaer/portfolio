# Phase 3 — Project System and Sarabo Case Study Report

**Date:** 2026-08-06
**Branch:** `master`
**Starting HEAD:** `a1309fa` (Phase 2 — design system and motion)

## 1. Executive summary

Phase 3 replaced the placeholder project list with a validated, richer project data model, a reusable set of case-study components, and the first complete case study — Sarabo, at `/work/sarabo`. `/work` and the homepage featured-projects section now derive entirely from the same data source; no hardcoded project arrays remain outside `client/src/data/projects.js`. Bang Learner and Note Bank continue to show an honest "in preparation" state, since their case-study evidence is not yet verified. No new dependencies were added. Full validation (format, lint, 86 client tests, 6 server tests, production build, 39 Playwright tests including 11 Axe scans) passes with zero accessibility violations.

## 2. Starting state

- Branch: `master`
- Starting HEAD: `a1309fa` (`feat: add portfolio design system and motion`)
- Working tree: one pre-existing uncommitted modification (see Section 3)

## 3. Pre-existing working-tree modification

`PORTFOLIO_MASTER_DOCUMENTATION.md` had one uncommitted modification (a stray leftover `$ claude --resume ...` line appended after the document's last real line) that predates this phase. Per the phase instructions this file was **not** discarded, restored, staged, or included in the Phase 3 commit. It remains modified and unstaged in the working tree after this phase's commit — this is expected, not an error.

## 4. Evidence inspected

- `CONTENT_CHECKLIST.md` §7 (Featured projects — Sarabo, Bang Learner, Note Bank)
- `client/src/data/projects.js` (previous shape, before refactor)
- `client/src/pages/WorkPage.jsx`, `client/src/pages/ProjectDetailsPage.jsx`, `client/src/sections/home/FeaturedProjectsPreview.jsx` (previous implementations)
- `client/src/hooks/usePageMeta.js` (existing metadata utility, reused as-is)
- Existing UI primitives (`Container`, `Section`, `SectionHeader`, `SectionLabel`, `Tag`, `Surface`, `Divider`, `StatusIndicator`, `ButtonLink`, `TextLink`, `VisuallyHidden`) and motion primitives (`Reveal`, `StaggerGroup`)
- Existing test suite structure and conventions (`client/tests/`)

No Sarabo repository or external documentation was available locally; all Sarabo facts come from `CONTENT_CHECKLIST.md` §7, which already distinguishes confirmed facts from `TODO_CONTENT`.

## 5. Verified Sarabo facts

- Title, problem statement, live client URL (`https://sarabo-jahid.web.app`), live API URL (`https://sarabo-server.vercel.app`).
- Confirmed key features: customer/technician/administrator roles; authentication and role-based workflows; repair-request lifecycle tracking; technician assignment; quotation management; notifications; customer reviews; Stripe payment flow.
- Confirmed technical decisions: React client; Node.js + Express API; MongoDB persistence; Firebase authentication/hosting integration; separate client and server deployments.

## 6. Missing Sarabo facts

Per `CONTENT_CHECKLIST.md`, still `TODO_CONTENT` and intentionally omitted from the public UI: exact role, team size, timeline, client/server repository URLs, public documentation URL, current status detail, 2–4 real challenges and solutions, result/outcome, what would be improved next, cover image, 5–10 screenshots, optional demo video. These are tracked in `project.missingContent` for each project (internal data only, never rendered).

**Judgment call flagged for review:** the workflow sequence (request → quotation → technician assignment → repair in progress → payment → review) and the two engineering-decision statements were composed directly from the confirmed feature/technical-decision lists above — they are not copied from separate process documentation, since none exists locally. No fact outside the confirmed list was introduced.

## 7. Project data model

`client/src/data/projects.js` now exports a `Project` shape (documented via JSDoc typedefs) with: `slug`, `title`, `summary`, `projectType`, `status` (`live` | `repository-available` | `archived`), `featured`, `stack`, `capabilities`, `links` (label/url/type), `caseStudyStatus` (`complete` | `in-preparation` | `none`), `caseStudy` (overview, roles, workflow, capabilities, architecture, decisions, challenge/outcome/reflection, section metadata), `relatedSlugs`, `seo` (title/description), and `missingContent`. All three current projects (Sarabo, Bang Learner, Note Bank) are `featured: true`; only Sarabo has `caseStudyStatus: "complete"`.

## 8. Validation and selectors

- `client/src/data/project-schema.js` — a custom, dependency-free validator (`validateProjects`) checking unique slugs, non-empty titles, allowed status/case-study-status/link-type values, valid or null link URLs, unique case-study section ids, related-slug existence, featured-project preview-data completeness, and complete-case-study required fields (`overview`, `roles`, `workflow`, `capabilities`). `assertValidProjects` throws with a descriptive message in development/test (module load fails loudly on a data mistake) and logs-and-continues in production (`import.meta.env.PROD`) so a data error never crashes the live site. `projects.js` calls this at module load.
- `client/src/features/projects/project-selectors.js` — pure functions: `getAllProjects`, `getFeaturedProjects`, `getProjectBySlug`, `getRelatedProjects`, `hasCompleteCaseStudy`, `getProjectLinks`. Each accepts an optional `projectList` for testing against fixtures.

## 9. Components

Thirteen components under `client/src/features/projects/`: `ProjectCard`, `FeaturedProjectDossier`, `ProjectStatus` (+ shared `project-status-meta.js` to keep fast-refresh-safe exports), `ProjectStack`, `ProjectLinks`, `ProjectHero`, `ProjectMetaGrid`, `ProjectSection` (skips rendering — no empty heading — when its content is empty), `ProjectSectionNav` (renders only once ≥4 sections exist), `ProjectArchitecture` and `ProjectWorkflow` (semantic HTML/CSS diagrams, not raster images), `RelatedProjects`, and `CaseStudyUnavailable` (the restrained missing-content note, reused for both the in-preparation route state and the Sarabo reflection section).

## 10. Work page

`WorkPage.jsx` now groups projects by `caseStudyStatus`/`status` derived from `getAllProjects()`: a "Full case studies" group (Sarabo, rendered as a numbered dossier), an "In preparation" group (Bang Learner, Note Bank, rendered as cards), and an "Archive" group that renders nothing today (no archived projects exist yet — an honest empty state rather than a forced section). The intro copy and project count are both computed from the data array. No filters were added — three projects does not justify them.

## 11. Sarabo case study

`/work/sarabo` renders a `ProjectHero`, a `ProjectSectionNav` (7 sections, well above the 4-section threshold), and `ProjectSection`s for Overview, Roles, Workflow (`ProjectWorkflow`), Capabilities, Architecture (`ProjectArchitecture`), Engineering decisions, and "Challenge, outcome and reflection" (renders `CaseStudyUnavailable`'s restrained note, since no verified challenge/outcome/reflection content exists). Related projects (Bang Learner, Note Bank) render via `RelatedProjects`.

## 12. Route states

`ProjectDetailsPage.jsx` resolves the slug via `getProjectBySlug`/`getRelatedProjects` and renders one of three states: the complete Sarabo case study, an honest in-preparation state for known incomplete projects (Bang Learner, Note Bank — `ProjectHero` + `CaseStudyUnavailable` + related projects), or the existing "Project not found" recovery state for unknown slugs (heading text unchanged from Phase 2, so the pre-existing integration test still passes). No optional field can crash the page — every case-study section is conditionally rendered.

## 13. Accessibility

Axe scans (zero violations) now cover `/work`, `/work/sarabo`, `/work/bang-learner` (known incomplete), and `/work/unknown-project` (recovery state), in addition to the existing route/mobile-menu/unknown-route scans — 11 Axe tests total. Status is always paired with text (`ProjectStatus`), external links carry descriptive, per-project accessible names (`ProjectLinks`), heading order stays H1 → H2 throughout `/work` and `/work/:slug`, and the section nav is a standard anchor list with no JS-driven scrolling.

## 14. Responsive verification

Automated: no horizontal overflow at 360px on both `/` (existing) and `/work/sarabo` (new). The architecture and workflow "diagrams" are plain stacked/wrapping HTML lists, so they reflow naturally at every breakpoint tested manually (360/390/768/1024/1280/1440) without a dedicated media query.

## 15. Bundle comparison

| Asset | Phase 2 | Phase 3 | Change |
|---|---|---|---|
| JS (gzip) | 151.76 kB | 155.99 kB | +4.23 kB |
| CSS (gzip) | 5.71 kB | 5.91 kB | +0.20 kB |
| index.html | 0.73 kB | 0.73 kB | unchanged |

No new dependency was added; the increase is entirely new first-party code. Route-level code splitting was not added — the increase is small and does not justify it this phase.

## 16. Tests

- **Unit:** `project-schema.test.js` (10 tests: valid data, duplicate slugs, invalid status, invalid link URL, null link URL allowed, missing required case-study field, duplicate section id, unknown related slug, featured-project validation, real data set passes with zero errors), `project-selectors.test.js` (10 tests), plus component tests for `ProjectCard`, `ProjectLinks`, `ProjectStatus`, `ProjectSection`, `CaseStudyUnavailable`, `RelatedProjects`.
- **Integration:** `WorkPage.test.jsx` (count/order derive from data), `ProjectDetailsPage.test.jsx` (extended: complete case-study structure, restrained-note fallback, no empty optional heading, known-incomplete preparation state, related projects, per-project metadata, plus the pre-existing not-found/no-crash tests), `HomeFeaturedProjects.test.jsx` (Sarabo links to `/work/sarabo`, every featured project renders from the central data source).
- **Playwright:** extended `axe.spec.js` and `smoke.spec.js` with known-incomplete-project, unknown-project, section-navigation, and Sarabo-specific 360px-overflow tests.

Totals: 86 client tests (was 38), 6 server tests (unchanged), 39 Playwright tests (was 33) — all passing.

## 17. Documentation updates

- `docs/05-implementation-roadmap.md` — Phase 3 entry added to "Implementation Progress".
- `README.md` — "Implementation Status" section updated for Phase 3.
- `CLAUDE_CODE_BUILD_PROMPTS.md` — Phase 3 entry added to "Execution History".
- `CONTENT_CHECKLIST.md` — not updated; no new fact was verified this phase (all Sarabo content used was already checked).
- `CLAUDE.md` — not updated; no permanent architecture or coding-convention change was introduced.

## 18. Files changed

- **Modified:** `client/src/data/projects.js`, `client/src/pages/ProjectDetailsPage.jsx`, `client/src/pages/WorkPage.jsx`, `client/src/sections/home/FeaturedProjectsPreview.jsx`, `client/tests/e2e/axe.spec.js`, `client/tests/e2e/smoke.spec.js`, `client/tests/integration/ProjectDetailsPage.test.jsx`, `README.md`, `docs/05-implementation-roadmap.md`, `CLAUDE_CODE_BUILD_PROMPTS.md`.
- **Added:** `client/src/data/project-schema.js`; 14 files under `client/src/features/projects/` (`CaseStudyUnavailable.jsx`, `FeaturedProjectDossier.jsx`, `ProjectArchitecture.jsx`, `ProjectCard.jsx`, `ProjectHero.jsx`, `ProjectLinks.jsx`, `ProjectMetaGrid.jsx`, `ProjectSection.jsx`, `ProjectSectionNav.jsx`, `ProjectStack.jsx`, `ProjectStatus.jsx`, `ProjectWorkflow.jsx`, `RelatedProjects.jsx`, `project-selectors.js`, `project-status-meta.js`); `client/tests/integration/HomeFeaturedProjects.test.jsx`, `client/tests/integration/WorkPage.test.jsx`; 8 files under `client/tests/unit/projects/`; this report.
- **Deleted:** `client/src/features/projects/.gitkeep` (superseded by real files in that directory).
- **Excluded from this commit:** `PORTFOLIO_MASTER_DOCUMENTATION.md` (pre-existing, unrelated modification — see Section 3).

## 19. Limitations

1. Sarabo's exact role, team size, timeline, repository URLs, public documentation URL, current status detail, challenges, outcome, next steps, cover image, screenshots, and demo video remain `TODO_CONTENT` per `CONTENT_CHECKLIST.md` and are honestly omitted from the live UI rather than invented.
2. Bang Learner and Note Bank remain in-preparation; no full case study exists for either yet, and Bang Learner has no confirmed live URL.
3. No archive-tier projects exist yet — the candidate archive projects listed in `CONTENT_CHECKLIST.md` (Jahid Worlds, Blood Donation Application, Hostel Management System, React mini-projects) have no confirmed presentation readiness, so the Work page's archive group is currently empty by design.
4. The Sarabo workflow sequence and engineering-decision text were composed from the confirmed feature/technical-decision lists rather than copied from separate verified process documentation (see Section 6) — worth a light content review once further Sarabo documentation becomes available.

## 20. Git result

- **Branch:** `master`
- **Previous HEAD:** `a1309fa`
- **New commit hash:** recorded after commit — see the console report printed at the end of this phase
- **Commit subject:** `feat: add project system and sarabo case study`
- **Files added:** 26 (see Section 18)
- **Files modified:** 10 (see Section 18)
- **Files deleted:** 1 (`client/src/features/projects/.gitkeep`)
- **Pre-existing unstaged modification after commit:** `PORTFOLIO_MASTER_DOCUMENTATION.md` (expected, not part of this commit)
- **Pushed:** No
- **Deployed:** No

## 21. Next-phase recommendation

Prompt 6 — review available evidence for Bang Learner and Note Bank (and any other candidate projects) and recommend the strongest second and third featured projects, per `CLAUDE_CODE_BUILD_PROMPTS.md`. Implementation of a second full case study should wait for that recommendation to be reviewed, since neither project currently has verified role/timeline/challenge/outcome evidence.

## 22. Final verdict

**B. PHASE 3 COMPLETE WITH CONTENT LIMITATIONS — REVIEW REQUIRED**

All code, tests, and validation are complete and passing. The verdict is B rather than A because Sarabo's case study — while structurally complete and fully honest about what's missing — is still built on partial evidence (no challenges, outcome, screenshots, or exact role), and the workflow/decisions text involved the judgment call noted in Section 6. Recommend a brief content review before treating Sarabo as fully final.
