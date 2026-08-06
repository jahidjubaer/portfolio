# CLAUDE.md — Jahid Hasan Portfolio

## Project mission

Build a highly professional, original, modern portfolio for Jahid Hasan, a CSE graduate, Frontend Developer, and Junior Software Engineer. The main portfolio must prioritize React/frontend credibility. Full-stack and AI/ML must appear as active growth directions, not inflated current expertise.

The product has two identities:

- **SYSTEM** — default professional portfolio.
- **STORY** — `/beyond`, containing photography, sports, leadership, volunteering, and personal work.

Read these files before implementation:

1. `docs/01-master-product-design-spec.md`
2. `docs/02-information-architecture-content.md`
3. `docs/03-technical-architecture.md`
4. `docs/04-animation-accessibility-performance.md`
5. `docs/05-implementation-roadmap.md`
6. `CONTENT_CHECKLIST.md`

When a conflict exists, use this priority:

1. User's latest explicit instruction.
2. `CLAUDE.md`.
3. Master product/design specification.
4. Technical and animation specifications.
5. Implementation roadmap.

---

## Non-negotiable product rules

- Do not copy the reference portfolios.
- Do not use a generic template layout.
- Do not invent experience, metrics, project results, clients, dates, or skills.
- Do not present Jahid as a senior, expert, or established AI/ML engineer.
- Do not make the personal side the default entry point.
- Do not hide required navigation behind experimental interaction.
- Do not ship weak placeholder copy in production.
- Do not add packages without explaining the need and checking existing dependencies.
- Do not use multiple libraries for the same responsibility.

---

## Required stack

**Architecture correction (2026-08-05, supersedes the original stack below the notice):** the project uses a plain React SPA client plus a separate Express.js API server, in a pnpm workspace. **Do not use TypeScript.** Do not use React Router Framework Mode, framework-generated route modules, or static framework prerendering — those were the original, incorrect direction and were fully removed. See `docs/audits/phase-1-architecture-correction-report.md` for the full rationale and migration record.

- React 19.
- JavaScript only (no TypeScript, no `.ts`/`.tsx` files).
- Vite.
- React Router DOM (client-side routing via `createBrowserRouter`/`RouterProvider`), not Framework Mode.
- Tailwind CSS 4.
- Node.js + Express.js for the API server (`server/`), separate from the client (`client/`).
- daisyUI 5 only for selected foundations, never as the visible theme.
- Motion for normal animation.
- GSAP + `@gsap/react` only for approved signature sequences.
- Lenis only as progressive enhancement.
- React Hot Toast only; do not add Toastify or Sonner.
- React Hook Form + Zod for contact.
- Lucide React only for general icons.
- Vitest, Testing Library, Playwright, Supertest, and Axe for quality.
- pnpm workspace (`client` + `server`).
- Node 22+.

Do not add Redux, Zustand, TanStack Query, AOS, Animate.css, Swiper, React Icons, Three.js, or a CMS in the MVP unless the user explicitly changes the architecture.

---

## Architecture rules

- Client (`client/`) and server (`server/`) are separate pnpm workspace packages.
- Routing is client-side via React Router DOM; there is no static framework prerendering or SSR.
- Keep content in typed-by-convention (JSDoc, not TypeScript) files under `client/src/data`.
- Keep route/page modules thin.
- Break page content into meaningful section components.
- Keep reusable primitives under `client/src/components/ui`.
- Keep feature-specific code under `client/src/features`.
- Keep all public claims in data, not buried inside JSX.
- Use semantic HTML first.
- Use links for navigation and buttons for actions.
- Use error boundaries (`errorElement`) where route/data failure can occur.
- The server (`server/`) exposes only the API endpoints a feature actually needs; do not add speculative routes, models, or auth.

---

## Design rules

- Follow the SYSTEM / STORY design concept.
- SYSTEM uses graphite, precise grid, restrained signal-lime/data accents, and technical/editorial structure.
- STORY uses warm charcoal, ivory, ember/gold, photography, and more organic editorial rhythm.
- Use one sans family and one mono family.
- Use custom design tokens. Do not rely on a default daisyUI theme.
- Avoid purple-blue gradients as primary identity.
- Avoid fake terminals, code rain, typewriter role cycling, percentage skill bars, and inflated counters.
- Avoid applying blur/glass to every surface.
- Use large typography carefully; never cause horizontal overflow.
- Make mobile layouts intentionally designed, not stacked desktop layouts.

---

## Animation rules

- Motion owns component, route, layout, hover, focus, and in-view animation.
- GSAP owns at most two approved timeline/scroll sequences.
- Never animate the same DOM property with both Motion and GSAP.
- Prefer `transform` and `opacity`.
- No required content may be inaccessible while waiting for animation.
- Disable Lenis, parallax, pinning, magnetic effects, and cursor effects for reduced motion.
- Custom cursor is desktop-only and may not replace the native cursor.
- All animation must clean up on unmount.
- Pause continuous animation when the page is hidden.
- Do not use an extended loader.

---

## Accessibility rules

- One visible H1 per page.
- Add a skip link.
- Keep heading order logical.
- All functionality must work by keyboard.
- Escape closes overlays.
- Return focus to overlay triggers.
- Use visible `:focus-visible` styles.
- Do not make information hover-only.
- Respect `prefers-reduced-motion`.
- Contact errors and submission status must be announced inline; toast is supplemental.
- Lightbox, drawer, and command palette must use accessible dialog behavior.
- Touch targets must be at least 44 × 44 px.
- Run Axe and manually test keyboard flow.

---

## Performance rules

- Pre-render public routes.
- Route-split Story, lightbox, and GSAP-heavy code.
- Define image dimensions.
- Use responsive AVIF/WebP assets.
- Do not lazy-load the LCP image.
- Lazy-load below-the-fold images.
- Do not import the entire photography gallery into the professional home bundle.
- Remove unused dependencies.
- Target LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Target Lighthouse 90+ mobile performance and 95+ accessibility/SEO.

---

## Content rules

Use verified positioning:

- Primary: Frontend Developer / Junior Software Engineer.
- Secondary: expanding into full-stack engineering.
- Exploration: AI/ML and AI-enabled products.

Recommended evidence:

- BSc in CSE from Metropolitan University.
- 250+ problems solved using C++.
- Sarabo as flagship full-stack case study.
- Bang Learner as a React/Firebase project.
- Leadership in sports and photography organizations.
- Photography and cricket as Beyond content.

If content is unknown, add an explicit `TODO_CONTENT` value and surface it in the implementation summary. Never invent it.

---

## Coding standards

- JavaScript only. Do not use TypeScript syntax, `.ts`/`.tsx` files, interfaces, enums, type assertions, or generics.
- Use JSDoc comments only where they materially improve editor support (e.g. documenting a data shape); JSDoc must not become hidden TypeScript.
- Prefer named exports for reusable components and utilities.
- Avoid nested ternaries.
- Avoid premature memoization.
- Do not use effects for values that can be derived during render.
- Keep event handlers readable and named when non-trivial.
- Use `cn()` for class merging.
- Use CVA only for genuine variants.
- Add comments only for non-obvious decisions, not to narrate simple code.
- Never commit secrets.
- Never expose private repository data.

---

## Working process

Before changing code:

1. Inspect the repository and relevant files.
2. State the phase and exact files likely to change.
3. Identify missing content or architectural conflicts.
4. Make a short implementation plan.

During changes:

- Work in one coherent phase or vertical slice.
- Reuse tokens and primitives.
- Preserve existing behavior unless the task explicitly changes it.
- Add tests with the feature.

After changes:

1. Run formatting if configured.
2. Run lint.
3. Run relevant tests (client and/or server).
4. Run production build.
5. Report files changed, behavior added, checks run, and remaining TODOs.

Do not claim a command passed unless it was executed successfully.

---

## Definition of done for every UI feature

- Correct content.
- Desktop, tablet, and mobile behavior.
- Keyboard behavior.
- Focus states.
- Reduced-motion behavior.
- Empty/error/loading states when relevant.
- Tests.
- No console error.
- Typecheck and build pass.
- No obvious performance regression.

---

## User confirmation boundaries

Ask for confirmation before:

- Publishing or changing personal contact information.
- Displaying CGPA.
- Claiming job availability.
- Selecting final featured projects when evidence is incomplete.
- Making the repository public.
- Deploying to a live domain.
- Adding analytics or tracking.
- Adding a paid external service.
- Replacing the agreed SYSTEM / STORY concept.

Do not ask for confirmation for ordinary implementation details already defined in the documentation.
