# Phase 0 — Repository Audit and Implementation Plan

**Audit date:** 2026-08-05
**Audited directory:** `C:\Users\TP\Desktop\portfolio`
**Auditor:** Claude Code (read-only Phase 0 pass)

---

## 1. Executive Summary

**Current repository condition:** The `portfolio` directory contains only documentation (`CLAUDE.md`, `PORTFOLIO_MASTER_DOCUMENTATION.md`, `CONTENT_CHECKLIST.md`, `CLAUDE_CODE_BUILD_PROMPTS.md`, `README.md`, and five files under `docs/`). There is **no application code**: no `package.json`, no lockfile, no `app/` directory, no `tsconfig.json`, no Vite/React Router config, no Tailwind/daisyUI config, no ESLint/Prettier config, no tests, no CI, no deployment config, and no `.env`/`.env.example`. Evidence: directory listing of `C:\Users\TP\Desktop\portfolio` returns exactly 5 files + `docs/`, and `docs/` contains exactly the 5 numbered specification files.

**Critical finding — repository isolation:** `C:\Users\TP\Desktop\portfolio` is **not its own Git repository**. Running `git rev-parse --show-toplevel` from inside it returns `C:/Users/TP` and `git rev-parse --git-dir` returns `C:/Users/TP/.git`. This means every `git` command run from this folder today operates on a repository rooted at the **Windows user profile home directory**, not on the portfolio. That repository:

- Has `origin` pointing to `https://github.com/jahidjubaer/PH2-Responsive-Flowers.git` — an unrelated prior class assignment, not a portfolio repository.
- Is on branch `main`, and `git status` reports it "has diverged" from `origin/main` by 4 local vs. 10 remote commits.
- Has pending unstaged **deletions** of dozens of files belonging to unrelated sibling projects (`Assigenment-Ph/PH9-Bang-Learner`, `PH2-Responsive-Flowers`, `Programing/Re_Cap/...`, `Web_Hero/...`, `english-janala/...`).
- Has **untracked** entries that include the entire Windows user profile surface: `.ssh/`, `.aws/`, `.netrc`, `.gitconfig`, `.bash_history`, `.node_repl_history`, `NTUSER.DAT`, `AppData/`, `Documents/`, `Downloads/`, `OneDrive/`, `Pictures/`, `Videos/`, `.claude/`, `.claude.json`, and more.

This is a severe, pre-existing repository-hygiene problem that exists independently of this project, but it directly affects whether it is safe to run `git add`, `git commit`, or `git push` from inside `portfolio` today. **No Phase 0 commands were run that touch git state**; this finding is reported, not acted on.

**Can implementation safely begin?** Yes, for non-git file creation and framework scaffolding *inside* `portfolio`. **No**, for any `git add`/`commit`/`push` until the repository-isolation question in Section 21 is resolved by the user, because the nearest `.git` is not scoped to this project.

**Recommended Phase 1 approach:** Before running any git-mutating command, resolve repository isolation (see Section 21). Then initialize React Router Framework Mode directly inside `portfolio` per `docs/03-technical-architecture.md`, using pnpm (enabled via the already-available `corepack`), Node 22+ (installed: v23.10.0), TypeScript strict mode, and the approved package list only.

**Most important risks:**
1. Git repository is not isolated to the project (Critical — Section 6, R1).
2. `pnpm` is not installed/available on `PATH`; only `corepack` and `npm` are present (Medium — mitigated by corepack).
3. Large volume of `TODO_CONTENT` items in `CONTENT_CHECKLIST.md` blocks later content-heavy phases (résumé PDF, portraits, Sarabo role/timeline/repos, live URLs, photography) but does not block Phase 1 foundation work.
4. No repository currently exists to host CI, so CI cannot be validated end-to-end until isolation is resolved.

**Final readiness status: READY WITH BLOCKERS**

Rationale: the documentation set is complete, internally consistent, and sufficient to start Phase 1 scaffolding with placeholder content. The only true blocker is the git-isolation issue, which must be resolved (a decision only the user can make) before any commit is created in Phase 1. Content gaps are numerous but are explicitly designed to be deferred via `TODO_CONTENT` and do not block foundation work.

---

## 2. Repository Identification

| Item | Finding | Evidence |
|---|---|---|
| Repository name | No dedicated repository for the portfolio exists | No `.git` directory inside `C:\Users\TP\Desktop\portfolio` |
| Actual Git root in effect | `C:/Users/TP` (Windows user profile home) | `git rev-parse --show-toplevel` → `C:/Users/TP` |
| Actual `.git` location | `C:/Users/TP/.git` | `git rev-parse --git-dir` → `C:/Users/TP/.git` |
| Current branch | `main` | `git branch --show-current` → `main` |
| Working-tree status | Diverged from `origin/main`; 4 local vs. 10 remote commits; many unstaged deletions; many untracked paths | `git status` output |
| Default/remote branch | `origin/main` on `https://github.com/jahidjubaer/PH2-Responsive-Flowers.git` | `git remote -v` |
| Uncommitted changes exist | Yes — dozens of unstaged deletions across unrelated sibling project folders | `git status` short list (see Section 4) |
| Repository contains unrelated work | Yes — the effective repository is the entire user home directory, containing unrelated class assignments, personal files, credentials directories, and OS artifacts | Untracked-file list includes `.ssh/`, `.aws/`, `.netrc`, `NTUSER.DAT`, `Documents/`, `Downloads/`, etc. |
| Would overwriting existing content be dangerous | Yes, at the home-directory-repo level (any `git add -A`/`git commit`/`git push` from here could stage or expose unrelated and sensitive files). Not dangerous at the `portfolio/` file level — its 6 files and `docs/` are self-contained and clearly authored for this project. | Directory listing of `portfolio/` vs. `git status` scope |
| Is this directory definitely the intended portfolio location | Yes, by content — `CLAUDE.md`, the numbered docs, and `CONTENT_CHECKLIST.md` all describe exactly this product and are already placed here | File contents read in full (Section "Required context") |

No file was deleted, overwritten, or staged during this audit.

---

## 3. Current Project State

| Item | Status | Evidence |
|---|---|---|
| Application framework | Missing | No `package.json`, no `app/` directory anywhere under `portfolio/` |
| React version | Missing | No `package.json` dependency entries exist |
| React Router mode/version | Missing | No `react-router.config.ts`, no `app/routes.ts` |
| TypeScript | Missing | No `tsconfig.json` |
| Vite | Missing | No `vite.config.ts` |
| Tailwind CSS | Missing | No `tailwind.config.*`, no `postcss.config.*`, no CSS files |
| DaisyUI | Missing | Not referenced anywhere; no config |
| Animation libraries (Motion, GSAP, Lenis) | Missing | No dependency manifest exists to check against |
| Form libraries (React Hook Form, Zod) | Missing | Same as above |
| Toast library (React Hot Toast) | Missing | Same as above |
| Testing tools (Vitest, Testing Library, Playwright, Axe) | Missing | No `tests/` directory, no config files |
| Linting (ESLint) | Missing | No `.eslintrc*` / `eslint.config.*` |
| Formatting (Prettier) | Missing | No `.prettierrc*` |
| Package manager (pnpm) | Requires verification / not currently available | `pnpm` not found on `PATH` (`which pnpm` fails); `corepack` **is** available (`corepack --version` → `0.32.0`), which can activate pnpm without a separate install |
| Node version | Present and compatible | `node --version` → `v23.10.0`, satisfies the documented `Node 22+` requirement |
| Build scripts | Missing | No `package.json` scripts exist |
| Deployment configuration | Missing | No `vercel.json`, no `netlify.toml`, no `.github/workflows/` |
| Environment-variable handling | Missing / not applicable yet | No `.env`, `.env.example`, or documented env vars found; `docs/03-technical-architecture.md` §10 references a contact-form provider access key as a future need only |

Overall classification: the project is at the **pre-scaffold** stage. Every technical requirement in `CLAUDE.md`'s "Required stack" is "Missing" in the literal sense of "not yet installed," which is expected and consistent with `docs/05-implementation-roadmap.md` Phase 0/1 boundary — this audit itself **is** that Phase 0.

---

## 4. Existing Repository Structure

```text
portfolio/
├── CLAUDE.md
├── CLAUDE_CODE_BUILD_PROMPTS.md
├── CONTENT_CHECKLIST.md
├── PORTFOLIO_MASTER_DOCUMENTATION.md
├── README.md
└── docs/
    ├── 01-master-product-design-spec.md
    ├── 02-information-architecture-content.md
    ├── 03-technical-architecture.md
    ├── 04-animation-accessibility-performance.md
    └── 05-implementation-roadmap.md
```

(No `node_modules`, `.git`, `dist`, `build`, coverage, or cache directories exist inside `portfolio/` to exclude — the tree above is the complete, unfiltered contents.)

- **Reusable directories:** `docs/` is reusable as-is and matches the path `CLAUDE.md` expects (`docs/01-...` through `docs/05-...`).
- **Conflicting directories:** None — there is nothing to conflict with the target architecture in Section 6 of `docs/03-technical-architecture.md`.
- **Obsolete files:** None identified. All six root files and five docs files are current (dated 2026-08-05) and referenced consistently by `CLAUDE.md` and `PORTFOLIO_MASTER_DOCUMENTATION.md`.
- **Files that must be preserved:** All existing files — they are the approved source of truth for every later phase.
- **Areas requiring migration:** None inside `portfolio/`. The only migration-shaped issue is external: the git-isolation problem in Section 2/6/18.

Sibling directories one level up (`Desktop/`) were visible only as byproducts of running `git status` from inside a repo rooted at the home directory (e.g., `Assigenment-Ph/`, `PH2-Responsive-Flowers/`, `Programing/`, `Web_Hero/`, `english-janala/`, and an untracked `sarabo/` and `my-app/`). These are **not part of the portfolio project** and were not modified. Note for later phases only: an untracked sibling directory named `sarabo/` exists at `Desktop/sarabo/` — this may be relevant source material for the Sarabo case study in Phase 5, but confirming that is out of scope for Phase 0 and must not be assumed.

---

## 5. Documentation Compliance Matrix

| Requirement | Document source | Current status | Evidence | Gap | Recommended action |
|---|---|---|---|---|---|
| React 19 | `CLAUDE.md`; `docs/03` §1 | Not installed | No `package.json` | Full | Install in Phase 1 per `docs/03` §4 |
| React Router Framework Mode | `CLAUDE.md`; `docs/03` §1, §2 | Not installed | No `react-router.config.ts` | Full | Scaffold via `create-react-router` in Phase 1 |
| TypeScript strict mode | `CLAUDE.md`; `docs/03` §1 | Not configured | No `tsconfig.json` | Full | Configure strict mode in Phase 1 |
| Tailwind CSS 4 | `CLAUDE.md`; `docs/03` §3.1, §8 | Not installed | No Tailwind config or CSS | Full | Install with `@tailwindcss/vite` in Phase 1 |
| DaisyUI 5 used selectively | `CLAUDE.md`; `docs/03` §8 | Not installed | No config | Full | Install in Phase 1/2, scope per `docs/03` §8 policy |
| SYSTEM and STORY identities | `docs/01` §5 | Not implemented | No CSS tokens, no `data-identity` attribute usage anywhere | Full | Implement in Phase 2 per `docs/03` §8 |
| Static pre-rendering | `docs/03` §2 | Not configured | No `react-router.config.ts` | Full | Configure `prerender()` in Phase 1 |
| Typed content under `app/data` | `docs/02` §6; `docs/03` §6 | Not present | No `app/` directory | Full | Create typed data files starting Phase 1/5 |
| Thin route modules | `docs/03` §5, §7 | Not applicable yet | No routes exist | N/A | Enforce during Phase 1+ implementation |
| Shared UI primitives | `docs/03` §7 | Not present | No `app/components/ui` | Full | Build in Phase 2 |
| Route-level error handling | `CLAUDE.md`; `docs/03` §5 | Not present | No routes exist | Full | Add error boundaries in Phase 1 |
| Direct-route production support | `docs/03` §2, §16 | Not verifiable yet | No build output exists | Full | Verify after Phase 1 build + deployment config |
| Motion as primary animation library | `CLAUDE.md`; `docs/04` §2 | Not installed | No dependency manifest | Full | Install in Phase 1, use starting Phase 3/4 |
| GSAP restricted to ≤2 approved sequences | `CLAUDE.md`; `docs/04` §2 | Not applicable yet | No code exists | N/A | Enforce when hero/scroll sequence is built (Phase 4/5) |
| Reduced-motion support | `docs/04` §5 | Not present | No CSS/stylesheet exists | Full | Add reduced-motion stylesheet in Phase 2 |
| Route splitting for STORY/gallery | `docs/03` §3.5 anti-goals; `docs/04` §8 | Not applicable yet | No routes exist | N/A | Verify at Phase 7/10 via bundle audit |
| Accessible command palette | `docs/01` §8.1; `docs/03` §7 | Not installed | `cmdk` not present | Full | Build in Phase 3 |
| Keyboard-accessible overlays | `CLAUDE.md`; `docs/04` §6 | Not applicable yet | No overlay components exist | N/A | Enforce from Phase 3 onward |
| Vitest | `CLAUDE.md`; `docs/03` §3.4 | Not installed | No `vitest.config.*`, no `tests/unit` | Full | Install/configure in Phase 1 |
| Testing Library | `docs/03` §3.4 | Not installed | Same as above | Full | Install in Phase 1 |
| Playwright | `docs/03` §3.4 | Not installed | No `playwright.config.*` | Full | Install in Phase 1, first specs in Phase 3 |
| Axe accessibility testing | `docs/03` §3.4, §14 | Not installed | `@axe-core/playwright` absent | Full | Install in Phase 1, run from Phase 3 onward |
| SEO metadata architecture | `docs/03` §11; `docs/02` §9 | Not present | No route metadata exists | Full | Implement per-route in Phase 9 (earlier routes need placeholder titles from Phase 1) |
| Project case-study routing | `docs/03` §5; `docs/02` §6.1 | Not present | No `app/routes/work/` | Full | Build in Phase 5 |
| Performance-budget strategy | `docs/04` §8 | Documented only, not enforced | Budgets defined in spec, nothing to measure yet | Full | Begin measuring from Phase 4 (home route) onward |

Every row above where "Current status" is "Not installed/present" reflects the same root cause: **no scaffold exists yet**. This is expected at Phase 0 and is not itself a defect.

---

## 6. Architecture Conflicts

| Conflict ID | Current implementation | Required implementation | Severity | Risk if unresolved | Recommended resolution | Phase |
|---|---|---|---|---|---|---|
| C1 | `portfolio/` has no `.git`; the effective repository root is `C:/Users/TP` with remote `PH2-Responsive-Flowers` | A dedicated, isolated repository for the portfolio (per `docs/03` §16 "GitHub repository") | Critical | Any `git add`/`commit`/`push` run from inside `portfolio/` today would operate on an unrelated, diverged, home-directory-scoped repository that also has untracked sensitive paths (`.ssh/`, `.aws/`, `.netrc/`). A careless `git add -A` could stage credentials or unrelated personal files for commit/push to a public GitHub repo. | User decides between: (a) `git init` directly inside `portfolio/` to create an isolated nested repository (Git resolves to the nearest `.git`, so this fully isolates future commands run from inside `portfolio/`), or (b) move/copy `portfolio/` contents into a freshly cloned empty repository elsewhere. See Section 21. | Before any commit in Phase 1 |
| C2 | `pnpm` is not present on `PATH` | `CLAUDE.md` mandates pnpm as the package manager | Medium | Phase 1 install commands from `docs/03` §4 (`pnpm dlx create-react-router@latest`, `pnpm add ...`) will fail as written | Enable pnpm via the already-installed `corepack` (`corepack enable`, `corepack prepare pnpm@latest --activate`) at the start of Phase 1 | Phase 1 |
| C3 | No CI configuration exists | `docs/03` §15 requires a GitHub Actions workflow (install → lint → typecheck → unit tests → build → Playwright smoke) | Low (currently) | CI cannot be validated until a resolved, hosted repository exists (depends on C1) | Add `.github/workflows/ci.yml` once repository isolation (C1) is resolved | Phase 1 |
| C4 | No environment-variable documentation exists | `docs/03` §10 implies a future contact-form provider key (Web3Forms, per `CONTENT_CHECKLIST.md` §3) | Low | Not yet a real gap — no env vars are needed until Phase 8 (Contact) | Document required env vars when the Contact phase begins | Phase 8 |

No stylistic conflicts were found or reported, per the instruction to exclude those.

---

## 7. Dependency Audit

### 7.1 Existing and approved

None. No `package.json` exists, so no dependencies are currently installed.

### 7.2 Existing but questionable or conflicting

None — there is nothing installed to question.

### 7.3 Required but missing

Per `docs/03-technical-architecture.md` §3 and §4, scoped to when each is actually needed (not all in Phase 1):

| Package | Responsibility | Phase needed | dependencies / devDependencies | Why not native/existing |
|---|---|---|---|---|
| `react`, `react-dom` | UI runtime | 1 | dependencies | Core requirement, no substitute |
| `react-router` | Framework-mode routing, loaders, pre-rendering | 1 | dependencies | Explicit architecture decision in `docs/03` §1 |
| `typescript` | Static typing | 1 | devDependencies | `CLAUDE.md` mandates strict TS |
| `tailwindcss`, `@tailwindcss/vite` | Styling/tokens | 1 | devDependencies | Required styling system |
| `daisyui` | Selected accessible foundations only (drawer, tooltip, modal, input states) | 2 | devDependencies | Explicitly scoped-down use per `docs/03` §8 |
| `eslint`, `prettier` | Code quality/formatting | 1 | devDependencies | Required by `CLAUDE.md` "Working process" |
| `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | Unit/integration testing | 1 | devDependencies | Required test stack |
| `@playwright/test`, `@axe-core/playwright` | E2E + accessibility automation | 1 (config), 3 (first real specs) | devDependencies | Required test stack |
| `motion` | Default animation library | 3–4 | dependencies | Owns component/route/hover animation per `docs/04` §2 |
| `lucide-react` | Icon set | 2–3 | dependencies | Only approved icon library |
| `cmdk` | Command palette | 3 | dependencies | Named explicitly in `docs/03` §3.3 |
| `clsx`, `tailwind-merge` | `cn()` utility | 2 | dependencies | Required by `CLAUDE.md` coding standards |
| `class-variance-authority` | Genuine component variants only | 2+ | dependencies | Allowed only "for genuine variants" per `CLAUDE.md` |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Contact form + validation | 8 | dependencies | Required stack for `/contact` |
| `react-hot-toast` | Supplemental toast feedback | 8 | dependencies | Only approved toast library |
| `gsap`, `@gsap/react` | ≤2 signature sequences only | 4 (hero) / 5 (scroll sequence), only if Motion cannot express it | dependencies | Explicitly gated — must justify use before installing, per `CLAUDE.md` and `docs/04` §2 |
| `lenis` | Progressive-enhancement smooth scroll | 4+ (optional) | dependencies | Desktop/no-reduced-motion only, per `docs/04` §2 |
| `yet-another-react-lightbox` | Accessible photography lightbox | 7 | dependencies | Named explicitly in `docs/03` §3.3, needed only for `/beyond` |

Do not install GSAP, Lenis, `cmdk`, `react-hook-form`/`zod`, `react-hot-toast`, or the lightbox during Phase 1 — none are needed until the phase that uses them, and `CLAUDE.md` requires justifying each package before adding it.

Verified against the exclusion list — none of the following appear anywhere in the repository, and none should be added per `CLAUDE.md` / `docs/03` §3.5:

- Redux — absent, correctly excluded.
- Zustand — absent, correctly excluded.
- TanStack Query — absent, correctly excluded.
- AOS — absent, correctly excluded.
- Animate.css — absent, correctly excluded.
- Swiper — absent, correctly excluded.
- React Icons — absent, correctly excluded.
- Three.js — absent, correctly excluded.
- A CMS — absent, correctly excluded.
- Multiple toast libraries — absent; only `react-hot-toast` is planned.
- Multiple general-purpose animation libraries — absent; Motion and GSAP have a defined, non-overlapping ownership split.

---

## 8. Content and Asset Audit

Source: `CONTENT_CHECKLIST.md` (read in full; this is the authoritative, most current content record — dated 2026-08-05).

| Item | Available | Verified | Location | Quality/issue | Blocks which phase | Required action |
|---|---|---|---|---|---|---|
| Professional name | Yes | Yes | `CONTENT_CHECKLIST.md` §1 | `Jahid Hasan` | — | None |
| Primary professional title | Yes | Yes | §1 | `Frontend Developer & Junior Software Engineer` | — | None |
| Hero statement | Yes | Yes | §2 | Selected draft copy present | — | None |
| Short biography | Partial | Recommended draft only | `docs/01` §9.4 | Marked "should be refined after final project/career details confirmed" | About (7) | Finalize wording once projects are confirmed |
| Professional portrait | No | No | §6 | `TODO_CONTENT` | Home (4), About (6) | Supply portrait, confirm publish permission |
| Résumé PDF | No | No | §5 | `TODO_CONTENT` | Résumé (6) | Supply final PDF, confirm links/date inside it |
| Public email | Yes | Yes | §3 | `jahidhasan.metro@gmail.com` | — | None |
| GitHub URL | Yes | Yes | §3 | `github.com/jahidjubaer` | — | None |
| LinkedIn URL | Yes | Yes | §3 | `linkedin.com/in/jahidjubaer` | — | None |
| Location | Yes | Yes | §1 | `Sylhet, Bangladesh` | — | None |
| Employment availability | Yes | Yes | §1 | "Open to frontend and junior software engineering opportunities" | — | None (per `CLAUDE.md`, still confirm before claiming availability if it changes) |
| Flagship project selection | Partial | Partial | §7 | Sarabo and Bang Learner have confirmed identity; role/timeline/repos for Sarabo are `TODO_CONTENT`; third slot (Note Bank vs. "Jahid Worlds") unresolved | Work (5, 6) | Confirm per Section 9 below |
| Project descriptions | Partial | Partial | §7 | Sarabo/Bang Learner/Note Bank summaries exist; challenge/outcome/reflection text is `TODO_CONTENT` for all three | Work (5, 6) | Supply case-study evidence |
| Project responsibilities | Partial | No | §7 | Sarabo's "exact role" is `TODO_CONTENT` | Work (5) | Supply |
| Project screenshots | No | No | §6, §7 | `TODO_CONTENT` for all projects | Work (5, 6) | Supply assets |
| Live project links | Partial | Partial | §7 | Sarabo has both client/server URLs; Bang Learner and Note Bank live URLs are `TODO_CONTENT` | Work (5, 6) | Supply or omit link |
| Repository links | Partial | Partial | §7 | Bang Learner and Note Bank repos present; Sarabo client/server repos are `TODO_CONTENT` | Work (5) | Supply |
| Project metrics | No | No | §7, §9 | Explicitly forbidden to invent per `CLAUDE.md` and checklist §15 | — | Do not add unless verified |
| Education details | Yes | Yes | §4 | Degree, university, graduation date confirmed; CGPA explicitly set to not-display | — | None |
| Problem-solving evidence | Yes | Yes | §9 | "250+ problems solved," platforms and profile links confirmed | — | None |
| Leadership roles and dates | Yes | Yes | §10 | Sports Club and Photographic Society roles/dates confirmed | — | None |
| Photography assets | No | No | §11 | 12–30 images required, none selected; alt text/titles/consent all `TODO_CONTENT` | Beyond (7) | Select, tag, and clear images |
| Testimonials | Not requested / not applicable | N/A | Not present anywhere in docs | Not part of scope per any document | — | None expected |
| Domain name | Not owned | No | §12 | Preferred `jahid-hasan.com`, ownership explicitly `No` | Deployment (11) | Purchase/connect domain or ship on a Vercel subdomain first |

This table is intentionally not exhaustive of every checklist line item — `CONTENT_CHECKLIST.md` itself remains the authoritative, living source and should be read directly for full detail (e.g., §13 "Final approvals" and §14 "Highest-priority missing inputs" already enumerate the same gaps in the user's own words).

---

## 9. Project Evidence Assessment

| Project | Technical depth | Frontend relevance | Completeness | Live evidence | Documentation quality | Case-study potential | Recommendation |
|---|---|---|---|---|---|---|---|
| Sarabo | High — multi-role (customer/technician/admin), auth, lifecycle tracking, Stripe payments, separate client/server (per `CONTENT_CHECKLIST.md` §7) | High — React client | Partial — features and tech decisions confirmed; role, timeline, repos, challenges, outcome all `TODO_CONTENT` | Yes — both client (`sarabo-jahid.web.app`) and server (`sarabo-server.vercel.app`) URLs present | Partial — feature/tech lists solid, narrative evidence missing | Highest of the three named projects, once evidence gaps are filled | **Primary flagship candidate** — matches `docs/01` §9.3 and `docs/05` Phase 5 recommendation, but cannot be finalized until `TODO_CONTENT` items in §7 are resolved |
| Bang Learner | Moderate — React, Tailwind, MongoDB, auth (per `CONTENT_CHECKLIST.md` §7) | High | Partial — repo present, live URL `TODO_CONTENT`, role/timeline/challenges `TODO_CONTENT` | No live URL confirmed | Moderate | Reasonable second flagship if live evidence and role detail are added | **Second flagship candidate**, pending live URL and role/timeline confirmation |
| Note Bank | Unclear — React/JS confirmed, Django backend mentioned but "must be verified" (§7) | Moderate — described as design/frontend contribution to a team project | Partial — repo present, live URL `TODO_CONTENT`, stack needs verification | No live URL confirmed | Low — team size, dates, ownership, stack all `TODO_CONTENT` | Weaker than Sarabo/Bang Learner until stack and ownership are verified | **Third flagship candidate at best; compact-archive candidate more likely** until verified |
| "Jahid Worlds" (referenced in `docs/01` §9.1 and `docs/02` §4 as a POS/e-commerce candidate) | Unknown | Unknown | Unknown — explicitly marked "pending verification" in both docs | Unverified | None found in `CONTENT_CHECKLIST.md` at all (no entry exists for it there) | Cannot assess — no evidence in the current content record | **Not ready to feature.** `docs/01`/`docs/02` mention it as a possibility, but `CONTENT_CHECKLIST.md` (the more current, dated document) lists it only under §7 "Archive projects" as `Jahid Worlds — presentation readiness: TODO_CONTENT`. Treat the checklist as authoritative per `CLAUDE.md`'s conflict-priority rule (user's latest instruction > CLAUDE.md > master spec) |
| Blood Donation Application, Hostel Management System, React mini-projects | Unknown | Unknown | Unconfirmed | Unconfirmed | None beyond a name | Not assessable | **Archive-only candidates**, `TODO_CONTENT` on presentation readiness — do not surface until each has a working repo/live link, accurate summary, and usable assets, per `CONTENT_CHECKLIST.md` §7 "Archive projects" instruction |

**Projects that should not be highlighted yet:** "Jahid Worlds," Blood Donation Application, Hostel Management System, and any unnamed "additional archive project" — all have `TODO_CONTENT` presentation-readiness status.

No project claims, metrics, or outcomes were invented to fill this table; every cell traces to `CONTENT_CHECKLIST.md` or is marked unknown/unverified.

---

## 10. Proposed Target File Structure

Directly from `docs/03-technical-architecture.md` §6, annotated with action per directory (none of this is created in Phase 0):

| Path | Action |
|---|---|
| `app/assets/` (images, projects, photography, textures) | Create (Phase 1 skeleton, populated per phase) |
| `app/components/ui/` | Create (Phase 2) |
| `app/components/layout/` | Create (Phase 3) |
| `app/components/navigation/` | Create (Phase 3) |
| `app/components/feedback/` | Create (Phase 8, contact status/toast) |
| `app/components/media/` | Create (Phase 5/7) |
| `app/features/command-palette/` | Create (Phase 3) |
| `app/features/identity-mode/` | Create (Phase 3) |
| `app/features/contact/` | Create (Phase 8) |
| `app/features/projects/` | Create (Phase 5) |
| `app/features/photography/` | Create (Phase 7) |
| `app/features/motion/` | Create (Phase 2+, shared variants) |
| `app/routes/` (home, about, beyond, contact, resume, not-found, work/index, work/detail) | Create (Phase 1 as thin placeholders, filled per phase) |
| `app/sections/home/`, `app/sections/about/`, `app/sections/beyond/` | Create (Phase 4, 6, 7 respectively) |
| `app/data/` (profile, projects, capabilities, timeline, leadership, photography, navigation) | Create (Phase 1 stub types, real data starting Phase 4/5) |
| `app/hooks/` | Create (Phase 2/3 as needed) |
| `app/lib/` (cn, metadata, analytics, forms, structured-data) | Create (Phase 1/2 for `cn`/`metadata`; later for `forms`/`structured-data`/`analytics`) |
| `app/styles/` (app.css, tokens.css, typography.css, utilities.css, reduced-motion.css) | Create (Phase 2) |
| `app/root.tsx`, `app/routes.ts` | Create (Phase 1) |
| `public/resume/`, `public/og/`, `public/icons/`, `robots.txt`, `sitemap.xml` | Create (`resume/` in Phase 6; `og/`, `robots.txt`, `sitemap.xml` in Phase 9; `icons/` in Phase 1 or 9) |
| `tests/unit/`, `tests/integration/`, `tests/e2e/` | Create (Phase 1 skeleton; populated per phase) |
| `docs/` | Reuse — already exists and populated |
| `docs/audits/` | Create — done in this audit, contains this report |
| `CLAUDE.md`, `react-router.config.ts`, `vite.config.ts`, `tsconfig.json`, `package.json` | `CLAUDE.md`: reuse (exists); the other four: create in Phase 1 |

No directory needs "Migrate," "Rename," or "Review before changing" — there is no prior application structure to reconcile.

---

## 11. Route and Rendering Plan

Per `docs/03-technical-architecture.md` §2 and §5, and `docs/01` §9:

| Route | Purpose | Rendering | Pre-render | Main data source | Code-splitting need | Error handling | SEO | Identity | Content blockers |
|---|---|---|---|---|---|---|---|---|---|
| `/` | Recruiter-facing overview | Static pre-render | Required | `app/data/profile.ts`, `projects.ts`, `capabilities.ts`, `timeline.ts` | Low (keep home bundle lean; exclude photography) | Root error boundary | Full metadata + Person JSON-LD | SYSTEM | Portrait, résumé, finalized 3 featured projects |
| `/work` | Work index | Static pre-render | Required | `app/data/projects.ts` | Low | Root error boundary | Full metadata | SYSTEM | Same project-selection gaps as home |
| `/work/:slug` | Case study | Static pre-render, one path per project | Required, generated from `projects.map(p => p.slug)` | `app/data/projects.ts` entry lookup | Route-level (architecture diagram component) | 404-equivalent redirect/boundary for unknown slug | Full metadata + structured data | SYSTEM | Sarabo/Bang Learner/Note Bank evidence gaps (Section 8) |
| `/about` | Biography, capability map, timeline, résumé link | Static pre-render | Required | `profile.ts`, `capabilities.ts`, `timeline.ts` | Low | Root error boundary | Full metadata | SYSTEM | Biography final wording pending project confirmation |
| `/beyond` | STORY identity, photography, leadership | Static pre-render | Required | `photography.ts`, `leadership.ts` | High — must route-split photography/lightbox code out of the professional bundle per `CLAUDE.md` performance rules | Root error boundary | Full metadata | STORY | Photography selection, alt text, consent (Section 8) |
| `/contact` | Contact form | Static pre-render | Required | `app/data/navigation.ts` (social links), form schema | Low | Inline form error states + root boundary | Full metadata | SYSTEM | Form provider key handling (Phase 8) |
| `/resume` | Résumé summary + PDF download | Static pre-render | Required | `profile.ts` | Low | Root error boundary | Full metadata | SYSTEM | Résumé PDF not yet supplied (Section 8) |
| `*` | 404 | Static/client fallback | N/A (catch-all) | None | Low | Is itself the error/catch-all route | Noindex | SYSTEM | None |

**Project slugs:** generated from the `slug` field on each `Project` entry in `app/data/projects.ts` (model defined in `docs/02` §6.1); `react-router.config.ts`'s `prerender()` maps `projects.map(p => "/work/" + p.slug)` per `docs/03` §2.

**Static project paths:** produced automatically by the `prerender()` array above at build time — no manual route registration per project is needed beyond the dynamic `work/:slug` route module.

**Direct route loads in production:** depend on static-host fallback configuration (per `docs/03` §16) so that pre-rendered HTML is served for known paths and a SPA fallback exists for any client-side-only paths; this must be validated against the chosen host (Vercel, per `CONTENT_CHECKLIST.md` §12) in Phase 11.

**404 handling:** the `*` route (`routes/not-found.tsx`) is both the design-spec 404 page (`docs/01` §9.8) and the React Router catch-all; it must return actions to Home, Work, and the command palette per spec, without an animation longer than the recovery action.

**Keeping `/beyond` and gallery code out of the professional bundle:** achieved through React Router's automatic per-route code splitting plus explicit lazy-loading of the lightbox library (`yet-another-react-lightbox`) and photography data (`photography.ts`) only inside the `/beyond` route tree, per `docs/04` §8 bundle targets ("Photography data and images not imported into the professional home bundle").

---

## 12. Design-System Implementation Plan

No UI is created in this phase; this documents the approach already specified in `docs/01` §7 and `docs/03` §8, for Phase 2 execution:

- **SYSTEM identity:** graphite canvas (`#070A0D`), signal-lime/data accents (`#B9FF46`/`#71D7FF`), technical/editorial structure — token values from `docs/01` §7.1.
- **STORY identity:** warm charcoal (`#151310`), ivory paper (`#EEE8DC`), ember/gold accents (`#FF6B3D`/`#E7B75F`) — same source.
- **Theme/colour tokens:** implemented as CSS custom properties in `app/styles/tokens.css` using Tailwind CSS 4's `@theme` directive, switched via `:root[data-identity="system"|"story"]` per `docs/03` §8.
- **Typography:** one sans family (Manrope Variable, or Geist Sans as the documented alternative) + one mono family (JetBrains Mono Variable / Geist Mono), per `docs/01` §7.2; type scale per `docs/01` §7.3.
- **Spacing/grid:** 12/6/4-column responsive grid, 1280px max content width, per `docs/01` §7.4.
- **Borders/radii/shadows:** 18–24px primary radius, 10–14px small radius, 1px borders, minimal shadows, per `docs/01` §7.6.
- **Motion tokens:** duration/easing scale from `docs/04` §3 (Instant/Quick/Standard/Slow/Cinematic; documented cubic-bezier values).
- **Z-index scale:** not explicitly enumerated in any doc — **`TODO_CONTENT`-equivalent gap**; must be defined during Phase 2 implementation (header, drawer, command palette, lightbox, toast all need a coordinated stacking order) rather than invented here.
- **Responsive breakpoints:** implied by the grid spec (`docs/01` §7.4, §10) and the QA viewport list (`docs/04` §10); exact Tailwind breakpoint values are an implementation decision for Phase 2, not specified numerically in the docs.
- **Focus styles:** visible `:focus-visible` treatment required everywhere per `CLAUDE.md` and `docs/04` §6.
- **Reduced-motion behaviour:** global CSS baseline plus explicit per-component opt-outs, per `docs/04` §5.
- **DaisyUI integration boundaries:** reusable for drawer, tooltip, modal foundation, and accessible input-state utilities only (`docs/03` §8); **not** allowed to define hero buttons, project cards, navigation, form layout, typography, or color palette. No default daisyUI theme may be visible in the shipped site (`CLAUDE.md`, `docs/03` §8).

---

## 13. Animation Technical Plan

| Interaction | CSS | Motion | GSAP | Lenis | Reduced-motion alternative |
|---|---|---|---|---|---|
| Hero introduction | Reduced-motion media query baseline | Default (staggered reveal) | Only if Motion cannot express the full signature sequence (`docs/04` §4.1) — decision to be justified in Phase 4, not pre-decided here | No | Skip straight to final state, 120–180ms fade |
| Route transitions | — | Owns this per `docs/04` §2 | No | No | Immediate route change + short opacity fade (`docs/01` §5.4) |
| Section reveals | — | Owns this (opacity/translate, single-trigger) | No | No | No reveal delay; content visible immediately |
| Project dossier interactions | Hover/focus base styles | Owns scale/border/metadata transitions | No | No | Equivalent focus-visible state without motion |
| Command palette | Dialog base styles | Owns open/close transition | No | No | Instant open/close |
| Mobile navigation (drawer) | — | Owns drawer transition | No | No | Instant show/hide |
| SYSTEM → STORY transition | Mask/clip fallback | Owns layout transition (or View Transition API) | Only if this is the second of the ≤2 approved GSAP sequences and genuinely requires pinned/synchronized timing (`docs/04` §2) — not decided here | No | Immediate route change, no mask animation |
| Photography gallery | Aspect-ratio placeholders | Owns opacity-in on load, lightbox scale/fade | No | No | No hover-only metadata; static captions |
| Hover and focus feedback | Base states | Owns all micro-interactions | No | No | Immediate state change |
| Scroll progress | — | Owns progress-bar transform | No | No | Static or removed indicator |
| Smooth scrolling | Native scroll is the baseline | — | — | Optional progressive enhancement, desktop + no-reduced-motion only | Native scroll only |

**Explicitly prevented (per `CLAUDE.md` and `docs/04`):**
- Motion and GSAP never control the same DOM element/property.
- No content is inaccessible while animation is pending.
- No excessive page-load animation (hero sequence capped at 900–1200ms first-visit, 300–450ms on repeat nav).
- Mobile removes fixed layers, custom cursor, and scroll pinning (`docs/04` §9).
- All continuous/looping animation pauses when the tab is hidden (`docs/04` §7).
- Reduced motion disables Lenis and forces native scrolling.

**GSAP and Lenis timing:** both are **deferred**, not required immediately. Neither is needed until a concrete hero (Phase 4) or scroll-orchestrated project sequence (Phase 5) is being built, and even then only if Motion genuinely cannot express the sequence — per `docs/04` §2 and `CLAUDE.md`'s package-justification rule.

---

## 14. Accessibility Plan

Directly from `docs/04` §6 and `CLAUDE.md`, mapped to phases:

| Area | Phase 1–3 requirement | Later-phase requirement |
|---|---|---|
| Semantic landmarks | One `<main>`, semantic `<nav>`/`<header>`/`<footer>` in the shell (Phase 3) | Maintain per new route (all phases) |
| Heading hierarchy | One visible H1 per route, enforced from placeholder pages onward (Phase 1) | Maintain as sections are added |
| Skip link | First focusable element, added with the shell (Phase 3) | — |
| Keyboard navigation | All shell navigation operable by keyboard (Phase 3) | Command palette, drawer, lightbox, contact form (Phases 3, 7, 8) |
| Focus management | Route-change focus moves to new heading/main landmark (Phase 3) | Modal/drawer/palette/lightbox focus trap + return-to-trigger (Phases 3, 7) |
| Command palette | Accessible dialog pattern, Escape closes, focus trapped (Phase 3) | — |
| Mobile drawer | Accessible dialog pattern (Phase 3) | — |
| Lightbox | N/A yet | Accessible dialog, keyboard operable, focus return (Phase 7) |
| Contact form | N/A yet | Labeled inputs, `aria-describedby` errors, live-region status, toast supplemental only (Phase 8) |
| Route changes | Focus intentionally moved, no disorientation (Phase 3) | Maintain through all later routes |
| Reduced motion | Global CSS baseline (Phase 2) | Explicit per-component opt-outs as Motion/GSAP land (Phases 3–7) |
| Colour contrast | Token pairs chosen to meet WCAG AA (Phase 2) | Verify with Axe once real copy/colour ship (Phase 10) |
| Touch targets | ≥44×44px enforced in primitive components (Phase 2) | Maintain |
| Screen-reader announcements | N/A yet | Live regions for contact status (Phase 8) |
| Error states | Root error boundary with readable fallback (Phase 1) | Route-specific and form-specific error states (Phases 5, 8) |

**Accessibility risks already present in the repository:** none detectable — there is no UI yet to audit. The only present risk is a *process* risk: `docs/01` §7.1 flags that final SYSTEM/STORY palettes "require visual testing" for contrast, which is correctly deferred rather than pre-approved here.

---

## 15. Performance and Bundle Plan

Directly from `docs/04` §8–9 and `docs/03` §12:

- **Pre-render strategy:** all seven public routes plus every project slug, via `react-router.config.ts`'s `prerender()` (Section 11 above).
- **Route splitting:** automatic per-route via React Router Framework Mode; explicit manual splitting required for the Beyond/lightbox/GSAP-heavy code so it never enters the home bundle.
- **Asset strategy:** AVIF/WebP with defined `width`/`height`, `srcset`/`sizes` for large images; JPEG/PNG fallback only where needed.
- **LCP-image handling:** never lazy-loaded, preloaded explicitly, budgeted at ≤180KB.
- **Gallery loading:** lazy-loaded, loaded only within `/beyond`, full lightbox images on demand only.
- **Font loading:** not yet decided in any doc beyond family choice — `TODO_CONTENT`-equivalent implementation detail for Phase 2 (self-hosted variable fonts vs. a font-loading service is not specified).
- **Animation loading:** Motion loaded globally (small, always used); GSAP loaded only on routes/components that use the ≤2 approved sequences; Lenis loaded only as an optional desktop enhancement.
- **Third-party script policy:** none currently planned beyond the contact-form provider (Web3Forms, per `CONTENT_CHECKLIST.md` §3) and privacy-conscious analytics (Vercel Web Analytics, same section) — both deferred to Phases 8–9.
- **Bundle-analysis strategy:** not yet configured; recommended as part of Phase 10 hardening (`docs/05` Phase 10 task list includes "Audit route bundles").
- **Core Web Vitals targets:** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (`CLAUDE.md`, `docs/04` §8).
- **Lighthouse targets:** 90+ mobile / 95+ desktop performance, 95+ accessibility/SEO/best-practices (`docs/04` §8).

| Dependency class | Loaded |
|---|---|
| React, React Router, Tailwind runtime CSS | Globally |
| Motion | Globally (lightweight, used everywhere) |
| Route-specific data (`projects.ts`, `photography.ts`, etc.) | Per route |
| `cmdk` (command palette) | Globally in the shell, but the palette UI itself can mount lazily on first invocation |
| GSAP + `@gsap/react` | Per route/component that uses an approved sequence |
| Lenis | Per route, gated on desktop + no-reduced-motion, effectively "on interaction with capable viewport" |
| `yet-another-react-lightbox` | Only within `/beyond`, on interaction (opening the lightbox) |
| Contact form libraries (`react-hook-form`, `zod`, `react-hot-toast`) | Only within `/contact` |

---

## 16. Testing Strategy

Per `docs/03` §14 and `docs/05`'s per-phase deliverables:

**Unit tests** (introduced Phase 1 config, real tests from Phase 1 data onward): data schemas/selectors, `cn()` utility, slug generation/lookup, metadata helpers, motion-preference helper, clipboard helper.

**Integration tests** (Phase 3 onward): header/mobile-drawer keyboard behavior, mode switch (SYSTEM/STORY), command palette search/actions, project dossier → case-study linking, contact validation and status states, route-level error states.

**End-to-end tests** (Phase 3 skeleton, expanded through Phase 8): all routes load directly (no 404 on refresh), Home → case study → next project, browser back/forward, SYSTEM → STORY → SYSTEM, mobile viewport journey, keyboard-only critical journey, reduced-motion journey, résumé link/download, contact success/error mocks, lightbox keyboard behavior (Phase 7), 404 recovery.

**Accessibility tests** (introduced Phase 3, run on every new route thereafter): Axe automated checks on Home, Work, Project detail, About, Beyond, Contact, command-palette-open, and mobile-menu-open states; manual keyboard walkthrough; focus-restoration checks; reduced-motion mode check; contrast verification.

Phase assignment follows `docs/05-implementation-roadmap.md` literally — Phase 1 sets up Vitest/Playwright configuration and the first placeholder-route smoke tests; each subsequent phase adds the tests for the feature it introduces, per that phase's "Deliverables" section.

---

## 17. Environment and Deployment Audit

- **Required environment variables:** none are currently defined anywhere in the repository. `docs/03` §10 anticipates a client-usable, restricted access key for the contact-form provider (Web3Forms, confirmed in `CONTENT_CHECKLIST.md` §3) — not yet named or documented.
- **Existing environment files:** none (no `.env`, `.env.example`, or `.env.local` found in `portfolio/`).
- **Whether secrets may already be exposed:** none found *inside* `portfolio/`. However, Section 2/6 (git isolation) means the *effective* git repository in scope today is the home directory, which contains `.ssh/`, `.aws/`, `.netrc`, and `.gitconfig` as **untracked** files. They are not committed, but they sit inside a working tree with a public remote — a latent risk if a future `git add -A` is ever run carelessly from a shell rooted above `portfolio/`. No secret values were read or printed in this audit.
- **Hosting assumptions:** Vercel, per `CONTENT_CHECKLIST.md` §12 ("Hosting: Vercel").
- **Static route fallback requirements:** required per `docs/03` §2/§16 — not yet configured, no host-specific config file exists.
- **Canonical-domain dependency:** `jahid-hasan.com` is preferred but **not yet owned** (`CONTENT_CHECKLIST.md` §12: "Domain ownership: No"). SEO work (Phase 9) needs a decided canonical URL before it can be finalized — currently `TODO_CONTENT` per §12 "Final canonical URL."
- **Preview-deployment indexing risk:** flagged correctly in `docs/03` §16 ("Preview deployments set to noindex when possible") — not yet implemented, nothing to index yet.
- **Security-header needs:** documented in `docs/03` §16 (nosniff, referrer-policy, permissions-policy, CSP after external services are known) — not yet configured.
- **CI requirements:** GitHub Actions workflow per `docs/03` §15 — cannot be usefully added until repository isolation (Section 6, C1) is resolved, since CI needs a real, dedicated GitHub repository to run against.
- **Production form-provider requirements:** Web3Forms confirmed as the provider (`CONTENT_CHECKLIST.md` §3); access-key handling and honeypot/CAPTCHA design are deferred to Phase 8 per `docs/03` §10.

No secret values exist to redact in this report — none were found.

---

## 18. Risk Register

| Risk ID | Risk | Probability | Impact | Severity | Mitigation | Owner phase |
|---|---|---|---|---|---|---|
| R1 | Git commands run from `portfolio/` operate on an unrelated, diverged, home-directory-rooted repository with sensitive untracked paths | High (it is the current state) | High — could expose personal/credential paths or corrupt an unrelated repo's history | Critical | Resolve isolation before first commit (Section 21) | 1 (pre-commit) |
| R2 | Over-animation beyond the spec's restrained standard | Medium | Medium — undermines credibility goal | Medium | Enforce `docs/04` motion ownership rules and duration caps during code review | 3–7 |
| R3 | Generic/templated appearance despite SYSTEM/STORY concept | Low–Medium | High — core differentiator of the product | Medium | Follow `docs/01` §11 anti-pattern list strictly | 2, 4 |
| R4 | Weak or missing project evidence (Sarabo role/timeline, Bang Learner/Note Bank live URLs) | High (currently true) | High — case studies are the primary credibility mechanism | High | Resolve `CONTENT_CHECKLIST.md` §7 gaps before Phase 5/6 content-freeze | 5, 6 |
| R5 | Incomplete content generally (résumé, portraits, photography) | High (currently true) | Medium — blocks specific routes, not the whole build | Medium | Track via `TODO_CONTENT`; hide unresolved sections rather than publish placeholders (`CONTENT_CHECKLIST.md` §15) | 4, 6, 7 |
| R6 | Incorrect professional positioning (overstating seniority/AI-ML expertise) | Low if docs are followed | High — explicit non-negotiable rule in `CLAUDE.md` | Medium | Enforce three-level positioning model (`docs/01` §3.4) in all copy review | 4, 6 |
| R7 | Bundle growth from motion/photography/lightbox code | Medium | Medium | Medium | Route-split per Section 15; measure at Phase 10 | 7, 10 |
| R8 | Mobile performance regressions from animation/photography | Medium | Medium | Medium | Follow `docs/04` §9 mobile performance mode | 4, 7, 10 |
| R9 | Accessibility regression as features accumulate | Medium | High | High | Run Axe + manual keyboard checks every phase per `docs/04` §10, not only at Phase 10 | All UI phases |
| R10 | Route deployment failure (direct-route 404s in production) | Medium until verified | High | High | Validate static-host fallback config against pre-rendered paths in Phase 1 build and again at Phase 11 | 1, 11 |
| R11 | Unverified contact form (silently failing in production) | Medium | Medium | Medium | Explicit rule already in `CLAUDE_CODE_BUILD_PROMPTS.md` Prompt 9: do not claim it works until a real production submission is tested | 8, 11 |
| R12 | Missing résumé blocks `/resume` and About download action | High (currently true) | Medium | Medium | Track as `TODO_CONTENT`; hide the download action until supplied | 6 |
| R13 | Low-quality/unoptimized images | Medium (no assets exist yet to judge) | Medium | Medium | Enforce source-dimension and format rules from `docs/01` §6 and `docs/03` §12 at intake | 4, 7 |
| R14 | Mixing SYSTEM and STORY identities inconsistently | Low–Medium | Medium — dilutes the core design concept | Medium | Enforce `data-identity` token boundaries strictly per Section 12 | 2, 7 |
| R15 | Claude Code changing too much in one uncontrolled pass | Low if phase discipline is followed | High — explicitly warned against in `PORTFOLIO_MASTER_DOCUMENTATION.md` | Medium | Follow the one-phase-per-session workflow in `CLAUDE_CODE_BUILD_PROMPTS.md` | All |

---

## 19. Phase-by-Phase Implementation Plan

### Phase 1 — Foundation
- **Objective:** Scaffold React Router Framework Mode app with strict TS, Tailwind 4, pnpm, static pre-rendering, placeholder routes, error handling, testing/CI scaffolding.
- **Prerequisites:** Repository-isolation decision resolved (Section 21); pnpm enabled via corepack.
- **Files created:** `package.json`, `tsconfig.json`, `vite.config.ts`, `react-router.config.ts`, `app/root.tsx`, `app/routes.ts`, `app/routes/*.tsx` (placeholders for all 7 routes + 404), `tests/` skeleton, `.github/workflows/ci.yml`, `.eslintrc`/`eslint.config.*`, `.prettierrc`.
- **Files modified:** None (nothing exists yet).
- **Packages:** `react`, `react-dom`, `react-router`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `eslint`, `prettier`, `vitest`, `@testing-library/*`, `@playwright/test`, `@axe-core/playwright`.
- **Features:** Working routes with semantic placeholder headings; root error boundary; 404 page; direct-route loading.
- **Tests:** Placeholder smoke tests confirming each route renders its H1; `pnpm check` script wired.
- **Content dependencies:** None — placeholders only.
- **Risks:** R1 (must resolve first), R10 (verify direct-route loads against the chosen host early).
- **Exit criteria:** `pnpm check` (lint + typecheck + test + build) passes; every route in Section 11 renders and pre-renders.
- **Deliverables:** Empty but structurally complete, keyboard-navigable, statically pre-rendered site shell.

### Phase 2 — Design system
- **Objective:** SYSTEM/STORY tokens, typography, primitives, reduced-motion baseline.
- **Prerequisites:** Phase 1 complete.
- **Files created:** `app/styles/tokens.css`, `typography.css`, `utilities.css`, `reduced-motion.css`; `app/components/ui/*` (Button, LinkButton, IconButton, Tag, SectionLabel, Surface, Container, TextLink, VisuallyHidden, SkipLink); `app/lib/cn.ts`.
- **Files modified:** `app/root.tsx` (skip link, base styles), route placeholders (adopt primitives).
- **Packages:** `daisyui` (scoped foundations only), `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`.
- **Features:** Full token system for both identities; accessible, tested primitives.
- **Tests:** Component tests for each primitive (rendering, variants, keyboard/focus behavior).
- **Content dependencies:** None.
- **Risks:** R14 (identity boundary discipline).
- **Exit criteria:** Primitives work in both identity modes, keyboard, and mobile widths.
- **Deliverables:** Design-system foundation (optionally a dev-only fixture route, removed before launch).

### Phase 3 — Application shell and navigation
- **Objective:** Header, mobile drawer, footer, command palette, focus/scroll management, identity-mode infrastructure, basic transitions.
- **Prerequisites:** Phase 2 complete.
- **Files created:** `app/components/layout/*` (SiteHeader, MobileNavigation, SiteFooter, PageShell, Section, Grid), `app/features/command-palette/*`, `app/features/identity-mode/*`.
- **Files modified:** `app/root.tsx`, all route files (wrap in shell).
- **Packages:** `cmdk`, `motion`.
- **Features:** Full site navigation, working command palette, SYSTEM/STORY switch infrastructure (without STORY content yet).
- **Tests:** Integration tests for navigation, drawer keyboard behavior, palette open/search/select, mode switch; Playwright specs for direct loads and back/forward.
- **Content dependencies:** `app/data/navigation.ts`.
- **Risks:** R9 (accessibility regressions begin to matter here).
- **Exit criteria:** Keyboard-only user reaches every route and operates every overlay with visible focus at all times.
- **Deliverables:** Fully navigable empty shell.

### Phase 4 — Professional homepage
- **Objective:** Build the full `/` experience per `docs/01` §9.1.
- **Prerequisites:** Phase 3 complete; at minimum placeholder project/capability/timeline data.
- **Files created:** `app/sections/home/*`, `app/data/profile.ts`, `capabilities.ts`, `timeline.ts` (initial).
- **Files modified:** `app/routes/home.tsx`.
- **Packages:** `motion` (already present); `gsap`/`@gsap/react` only if justified for the hero sequence.
- **Features:** Hero, proof strip, featured dossiers (placeholder projects if Phase 5 data isn't ready), engineering approach, capability map, journey snapshot, Beyond portal, contact CTA.
- **Tests:** Home Playwright smoke test; reduced-motion variant check.
- **Content dependencies:** Hero copy (available), portrait (`TODO_CONTENT`), 3 confirmed featured projects (partially blocked, see Section 9).
- **Risks:** R2, R4, R6, R13.
- **Exit criteria:** Recruiter-outcome criterion from `docs/01` §12 is met in review.
- **Deliverables:** Complete, responsive, reduced-motion-safe home route.

### Phase 5 — Project system and first case study
- **Objective:** Typed project data, `/work`, `/work/:slug`, Sarabo case study.
- **Prerequisites:** Sarabo evidence gaps in Section 8/9 resolved enough to write an honest case study (role, timeline, at least directional challenge/outcome/reflection).
- **Files created:** `app/data/projects.ts`, `app/features/projects/*`, `app/routes/work/index.tsx`, `app/routes/work/detail.tsx`, architecture-diagram component.
- **Files modified:** `react-router.config.ts` (add project slugs to `prerender()`), home dossiers (link to real slugs).
- **Packages:** None new beyond Phase 1–4 set.
- **Features:** Full case-study template per `docs/01` §9.3's 17 required sections.
- **Tests:** Project data unit tests (lookup/slug), integration test (data → detail page), direct-route Playwright test for `/work/sarabo`.
- **Content dependencies:** Sarabo `TODO_CONTENT` items (Section 8).
- **Risks:** R4 (blocking), R10.
- **Exit criteria:** Sarabo case study explains problem, role, approach, decisions, challenge, result, reflection with only verified content.
- **Deliverables:** `/work` and one complete `/work/:slug`.

### Phase 6 — Additional case studies
- **Objective:** Recommend and implement second (and possibly third) case study.
- **Prerequisites:** Bang Learner (and/or Note Bank) evidence gaps resolved per Section 9's recommendation ranking.
- **Files created:** Additional project data entries; reused case-study section components.
- **Files modified:** `app/data/projects.ts`, `prerender()` list.
- **Packages:** None new.
- **Features:** Second complete case study; weaker projects (Note Bank, others) placed in a compact archive rather than a full case study, per `docs/02` §4.
- **Tests:** Same pattern as Phase 5 for the new slug.
- **Content dependencies:** Whichever project is chosen per the Section 9 ranking, once its gaps are filled.
- **Risks:** R4.
- **Exit criteria:** At least two complete `/work/:slug` routes exist (MVP requirement per `docs/05` §2).
- **Deliverables:** Second case study + archive list.

### Phase 7 — About and résumé
- **Objective:** `/about` and `/resume`.
- **Prerequisites:** Biography finalized enough to publish; résumé PDF supplied.
- **Files created:** `app/sections/about/*`, `app/routes/about.tsx` content, `app/routes/resume.tsx` content, `public/resume/jahid-hasan-resume.pdf`.
- **Files modified:** `app/data/timeline.ts`, `capabilities.ts` (finalized).
- **Packages:** None new.
- **Features:** Biography, principles, full capability map, timeline, education, problem-solving evidence, leadership summary, résumé download.
- **Tests:** Route tests; capability-map rendering test (no percentage bars, per `CLAUDE.md`).
- **Content dependencies:** Résumé PDF (`TODO_CONTENT`), biography finalization.
- **Risks:** R6, R12.
- **Exit criteria:** No skill shown as an arbitrary percentage; every claim has evidence or an honest "learning" label.
- **Deliverables:** `/about`, `/resume`.

### Phase 8 — Beyond the Code
- **Objective:** `/beyond` STORY experience.
- **Prerequisites:** Photography selection (12–30 images), alt text, and consent confirmed per `CONTENT_CHECKLIST.md` §11.
- **Files created:** `app/sections/beyond/*`, `app/features/photography/*`, `app/data/photography.ts`, `leadership.ts`.
- **Files modified:** `app/routes/beyond.tsx`, home page's Beyond portal (link to real content).
- **Packages:** `yet-another-react-lightbox` (route-split into `/beyond` only).
- **Features:** STORY hero, contact sheet, optional category filtering, lightbox, sports/leadership/volunteering stories, return-to-SYSTEM action.
- **Tests:** Keyboard/reduced-motion tests for the lightbox; bundle check confirming photography code is absent from the home bundle.
- **Content dependencies:** Photography assets, consent (Section 8, R5).
- **Risks:** R5, R7, R14.
- **Exit criteria:** Personal route feels visually distinct but remains clearly part of the same brand.
- **Deliverables:** `/beyond` with working photography/lightbox.

### Phase 9 — Contact
- **Objective:** `/contact` with real form provider.
- **Prerequisites:** Web3Forms account/key available (provider already confirmed in `CONTENT_CHECKLIST.md` §3).
- **Files created:** `app/features/contact/*`, `app/routes/contact.tsx` content, form schema.
- **Files modified:** None outside contact feature.
- **Packages:** `react-hook-form`, `zod`, `@hookform/resolvers`, `react-hot-toast`.
- **Features:** Validated form, honeypot, inline accessible status, toast as supplemental feedback, email-copy action, verified social links.
- **Tests:** Success/error mocks, Playwright form-state tests.
- **Content dependencies:** None beyond already-confirmed contact details.
- **Risks:** R11 (do not claim production success without a real test).
- **Exit criteria:** A real production submission succeeds and is accessibly confirmed.
- **Deliverables:** `/contact`.

### Phase 10 — SEO and structured data
- **Objective:** Full discoverability layer.
- **Prerequisites:** Canonical domain decided (Section 17 — currently blocked on domain purchase).
- **Files created:** `app/lib/metadata.ts`, `structured-data.ts`, `public/og/*`, `public/robots.txt`, `public/sitemap.xml`, `public/icons/*`.
- **Files modified:** Every route file (add metadata exports).
- **Packages:** None new.
- **Features:** Unique per-route title/description/canonical/OG/Twitter metadata, Person JSON-LD, project structured data, sitemap, robots, favicons, preview noindex.
- **Tests:** Metadata-helper unit tests; manual social-preview validation.
- **Content dependencies:** Final canonical domain (`TODO_CONTENT` per `CONTENT_CHECKLIST.md` §12).
- **Risks:** None new beyond the domain gap.
- **Exit criteria:** Every route has correct title, description, canonical, share image, and crawl behavior.
- **Deliverables:** Complete SEO layer.

### Phase 11 — Quality hardening
- **Objective:** Accessibility/performance/motion audit and fixes.
- **Prerequisites:** Phases 1–10 substantially complete.
- **Files created:** Audit report artifact (e.g., `docs/audits/phase-11-quality-audit.md`).
- **Files modified:** Wherever critical/serious issues are found.
- **Packages:** Bundle-analysis tooling only if genuinely needed (justify before adding).
- **Features:** None new — fixes only.
- **Tests:** Full Axe run across all routes/overlay states; Playwright regression suite; Lighthouse if available.
- **Content dependencies:** None.
- **Risks:** R2, R7, R8, R9, R13.
- **Exit criteria:** Meets `docs/04` §8 quality thresholds or documents justified exceptions.
- **Deliverables:** Audit report with target/measured/status/exception table.

### Phase 12 — Deployment preparation
- **Objective:** Prepare (not execute) production deployment.
- **Prerequisites:** Phase 11 complete; domain decision made.
- **Files created:** Hosting config (e.g., Vercel project settings documented, not necessarily a committed file), security-header configuration, launch checklist doc.
- **Files modified:** None in application code, unless a hosting adapter file is genuinely required.
- **Packages:** None new.
- **Features:** Static route fallback, production env documentation, security headers, domain/canonical configuration points, CI deployment checks.
- **Tests:** CI deployment-check job.
- **Content dependencies:** Domain purchase/connection (currently `No` per `CONTENT_CHECKLIST.md` §12), all final-approval checkboxes in §13.
- **Risks:** R10, and the explicit `CLAUDE.md` requirement to ask before "Deploying to a live domain" and "Making the repository public."
- **Exit criteria:** Everything is ready to deploy; nothing is actually deployed without explicit user approval.
- **Deliverables:** Launch checklist; no live deployment yet.

---

## 20. Recommended Phase 1 Scope

**Exact tasks:**
1. Resolve repository isolation per Section 21 (user decision — must happen before step 2 involves any commit).
2. Enable pnpm via `corepack enable` and `corepack prepare pnpm@latest --activate`.
3. Scaffold with `pnpm dlx create-react-router@latest` directly into `portfolio/` (or equivalent manual setup matching `docs/03` §4/§6), configuring `ssr: false` + `prerender()` per `docs/03` §2.
4. Configure TypeScript strict mode in the generated `tsconfig.json`.
5. Add Tailwind CSS 4 + `@tailwindcss/vite`.
6. Add ESLint + Prettier configs.
7. Add Vitest + Testing Library + Playwright + `@axe-core/playwright`, with minimal config and one placeholder test per tool.
8. Create the 7 route modules + `*` catch-all listed in Section 11, each with a semantic H1 placeholder and route metadata stub.
9. Add a root error boundary.
10. Add a minimal GitHub Actions workflow (`install → lint → typecheck → unit tests → build`; Playwright smoke can be a follow-up within Phase 1 or start of Phase 3).

**Exact configuration goals:** strict TS, `ssr: false` + static `prerender()` listing all 7 routes (project slugs added later in Phase 5), pnpm as the only package manager, Node engine `>=22` declared in `package.json`.

**Exact routes to scaffold:** `/`, `/work`, `/work/:slug` (module present even with no data yet), `/about`, `/beyond`, `/contact`, `/resume`, `*`.

**Exact test setup:** `vitest.config.ts` + one passing unit test; `playwright.config.ts` + one passing smoke test (e.g., home route renders its H1); Axe wiring can be a stub call added in Phase 3 once real overlays exist.

**Exact CI setup:** a single workflow file running `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` on pull request and `main`.

**Packages allowed during Phase 1:** `react`, `react-dom`, `react-router`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `eslint`, `prettier`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`, `@axe-core/playwright`.

**Packages explicitly deferred:** `daisyui` (Phase 2), `motion` (Phase 3/4), `gsap`/`@gsap/react` (Phase 4/5, only if justified), `lenis` (Phase 4+, optional), `lucide-react`/`cmdk`/`clsx`/`tailwind-merge`/`class-variance-authority` (Phase 2/3), `react-hook-form`/`zod`/`@hookform/resolvers`/`react-hot-toast` (Phase 8), `yet-another-react-lightbox` (Phase 7).

**Files expected to change:** everything under Section 10's Phase-1 "Create" rows; no existing documentation file should need to change.

**Commands that must pass:** `pnpm lint`, `pnpm typecheck` (`react-router typegen && tsc --noEmit`), `pnpm test`, `pnpm build` — i.e., `pnpm check` as defined in `docs/03` §15.

**Definition of done:** matches `docs/05-implementation-roadmap.md` Phase 1 exactly — "All routes render placeholder headings. Direct route loading works. `pnpm check` passes," and "the production build generates static output for every defined route."

Phase 1 is **not implemented** as part of this Phase 0 audit.

---

## 21. Questions and Decisions Required

### Blocking before Phase 1

1. **Repository isolation (Section 2, 6 — Conflict C1).** `portfolio/` currently has no `.git` of its own; the nearest one is at `C:/Users/TP` with a diverged history and a remote pointing to an unrelated repository (`PH2-Responsive-Flowers`), and it has untracked sensitive paths (`.ssh/`, `.aws/`, `.netrc/`). Before any commit is made for this project, the user must choose one of:
   - Run `git init` directly inside `portfolio/` (creates a nested repo that isolates all future git commands run from inside it — recommended, minimal, and reversible), or
   - Move/copy the `portfolio/` contents into a separate, freshly initialized location/repository, or
   - Some other explicit instruction for how the home-directory repository should be handled (this audit takes no position on fixing the home-directory repository itself, since that is outside this project's scope).

### Required before relevant later phases

2. Sarabo: exact role, team size, timeline, client/server repository URLs, current status, 2–4 real challenges/solutions, result, and what would be improved — needed before Phase 5 (`CONTENT_CHECKLIST.md` §7).
3. Bang Learner and Note Bank: live URLs and remaining case-study evidence — needed before Phase 6, and before either can be confirmed as the second flagship (Section 9).
4. Final selection and priority order of the third featured project vs. archive-only status for "Jahid Worlds," Blood Donation Application, Hostel Management System — needed before Phase 5/6 finalization (Section 9).
5. Professional portrait(s) and personal/Beyond portrait, with publish permission — needed before Phase 4 (home hero) and Phase 8 (Beyond).
6. Résumé PDF (final file, last-updated date, verified links inside it) — needed before Phase 7.
7. Photography selection (12–30 images), categories, alt text, titles, location/year metadata, and consent for recognizable people — needed before Phase 8.
8. Domain purchase/connection for `jahid-hasan.com`, or an interim canonical URL decision (e.g., a Vercel-provided subdomain) — needed before Phase 10 (SEO) can be finalized and before Phase 12 (deployment).
9. Web3Forms account/access-key provisioning — needed before Phase 9 (Contact) can connect to a real production endpoint.
10. Final approvals listed in `CONTENT_CHECKLIST.md` §13 (professional content, personal content, public contact details, project claims, photography, résumé, analytics/privacy, production deployment) — needed before Phase 12 launch, per `CLAUDE.md`'s "User confirmation boundaries."

### Recommended but non-blocking

11. Whether to add the minimal CI workflow in Phase 1 itself or defer the Playwright-smoke CI step to Phase 3 once the shell exists (either is consistent with `docs/03` §15; Phase 1 only strictly needs install/lint/typecheck/unit/build).
12. Whether to self-host variable fonts (Manrope/JetBrains Mono) or use an alternative delivery method — not specified numerically in any doc, a Phase 2 implementation decision.
13. Exact Tailwind breakpoint values and z-index scale — not enumerated in any doc, a Phase 2 implementation decision within the documented grid/rhythm constraints.

No question above has an answer already present in the repository or documentation — each was checked against `CONTENT_CHECKLIST.md` and the five numbered docs before being listed.

---

## 22. Final Recommendation

**Recommended repository strategy:** Resolve the isolation issue in Section 21 Q1 first (recommend `git init` directly inside `portfolio/` as the least disruptive option, since it does not require moving any files and Git will use the nearest `.git` for all future commands run inside this directory). Do this before Phase 1's first commit.

**Recommended architecture strategy:** Proceed exactly as specified in `docs/03-technical-architecture.md` — React Router Framework Mode with `ssr: false` and static `prerender()`, TypeScript strict, Tailwind CSS 4, pnpm (via corepack), and the phased package list in Section 7.3/Section 20. No deviation from the documented stack is warranted by anything found in this audit.

**Recommended first implementation action:** Have the user decide the repository-isolation question (Section 21 Q1), then begin Phase 1 exactly as scoped in Section 20.

**Can Phase 1 begin?** Yes, once the repository-isolation decision is made. Nothing else in the documentation or repository state blocks starting Phase 1 with placeholder content.

**Blocking issues:** 1 (repository isolation — Section 21, Q1).

**Files that must not be touched yet:** Nothing inside `portfolio/` is at risk of being "touched wrongly" — there is no legacy code to preserve. The caution applies entirely outside this project: no `git add`/`commit`/`push` should be run from any shell rooted at or above `C:\Users\TP` until Q1 is resolved, to avoid staging unrelated or sensitive files from the home-directory repository.

**Final readiness status: READY WITH BLOCKERS**
