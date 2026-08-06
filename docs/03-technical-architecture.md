# 03 — Technical Architecture Specification

> **Architecture correction (2026-08-05):** this document originally specified React Router Framework Mode with TypeScript and static pre-rendering. That direction was fully replaced by a plain React SPA client (`client/`) plus a separate Express.js API server (`server/`), in a pnpm workspace, using JavaScript only. See `docs/audits/phase-1-architecture-correction-report.md` for the full rationale and migration record. Sections 1–6, 15, and 16 below reflect the corrected architecture. Sections covering design tokens, state scope, forms, SEO content, image budgets, testing intent, and maintenance cadence (7–14, 17) remain valid in spirit even though code samples elsewhere in this suite may still show `.tsx`/framework-route syntax from the original draft — treat those as illustrative of intent, not literal syntax to reproduce.

## 1. Architecture decision

Use a **React SPA client** (Vite + React Router DOM, client-side routing only) paired with a **separate Node.js + Express.js API server**, in a **pnpm workspace** (`client/` + `server/`).

Why:

- Matches the user's explicit architecture decision: plain React SPA, JavaScript only, no framework-owned routing or build pipeline.
- Keeps the frontend deployable as static assets to any static host or CDN.
- Keeps the backend free to grow (contact form handling, project/content APIs, future integrations) without coupling it to the frontend build or forcing SSR.
- Avoids TypeScript and React Router Framework Mode entirely, per the corrected `CLAUDE.md` stack.

### Baseline

As of 5 August 2026 (corrected):

- React 19.
- React Router DOM (client-side routing via `createBrowserRouter`/`RouterProvider`), current stable.
- Vite (client build tool).
- Node.js 22+.
- JavaScript only — no TypeScript anywhere.
- Tailwind CSS 4.
- daisyUI 5, used selectively (deferred to Phase 2).
- Node.js + Express.js for the API server.

Use the latest mutually compatible stable package versions during implementation. Do not hard-code old versions merely because they appear in this document.

---

## 2. Rendering strategy

The client is a pure client-side-rendered SPA. There is no static pre-rendering and no SSR.

- The production build (`vite build`) emits a single `index.html` plus hashed static assets.
- The hosting platform must rewrite all non-file paths to `index.html` (an SPA fallback rule) so that direct loads of `/work`, `/about`, `/work/:slug`, etc. resolve to the app shell, which then renders the correct route client-side.
- Directly loading `/work/sarabo` must not return a raw 404 from the host — it must serve the SPA shell, which then renders either the project view or the app's own not-found state depending on whether the slug exists in `client/src/data/projects.js`.
- Local development/testing must configure the dev/preview server's SPA fallback equivalently (Vite's dev server does this by default; `vite preview` requires the same rewrite behavior for nested paths without a trailing slash — verify this explicitly when configuring hosting in Phase 12).

---

## 3. Package strategy

### 3.1 Core

| Package | Purpose | Decision |
|---|---|---|
| `react` / `react-dom` | UI runtime | Required |
| `react-router-dom` | Client-side routing | Required |
| `vite` / `@vitejs/plugin-react` | Client build tool | Required |
| `tailwindcss` | Styling and design tokens | Required |
| `@tailwindcss/vite` | Tailwind Vite integration | Required |
| `daisyui` | Selected accessible patterns and semantic utilities | Selective, deferred to Phase 2 |
| `express` | API server | Required (`server/`) |
| `cors` | Cross-origin requests from the client dev/prod origin | Required (`server/`) |
| `helmet` | Baseline HTTP security headers | Required (`server/`) |
| `dotenv` | Server environment variable loading | Required (`server/`) |

TypeScript is not used anywhere in this project.

### 3.2 Motion

| Package | Purpose | Ownership |
|---|---|---|
| `motion` | Page transitions, layout transitions, micro-interactions, in-view reveals | Default animation library |
| `gsap` | Signature timeline sequences only | Limited |
| `@gsap/react` | Scoped GSAP lifecycle and cleanup | Required only with GSAP |
| `lenis` | Smooth scrolling enhancement | Desktop/no-reduced-motion only |

Rule: Motion owns component animation. GSAP owns at most two complex, scroll-orchestrated sequences. Never animate the same element/property with both.

### 3.3 UI and utility

| Package | Purpose |
|---|---|
| `lucide-react` | Consistent icon set |
| `cmdk` | Command palette |
| `react-hot-toast` | Contact and clipboard feedback |
| `react-hook-form` | Contact form state |
| `zod` | Runtime form validation |
| `@hookform/resolvers` | React Hook Form + Zod integration |
| `clsx` | Conditional class names |
| `tailwind-merge` | Safe Tailwind class merging |
| `class-variance-authority` | Controlled component variants |
| `yet-another-react-lightbox` | Accessible photography lightbox |

### 3.4 Testing and quality

| Package | Purpose |
|---|---|
| `vitest` | Unit and integration tests |
| `@testing-library/react` | Component behavior tests |
| `@testing-library/jest-dom` | DOM assertions |
| `@testing-library/user-event` | Realistic interactions |
| `@playwright/test` | End-to-end and responsive tests |
| `@axe-core/playwright` | Automated accessibility checks |
| `eslint` | Code-quality rules |
| `prettier` | Formatting |

### 3.5 Packages deliberately excluded from MVP

- Redux or Zustand: unnecessary global business state.
- TanStack Query: static local content does not need server-state caching.
- Multiple toast libraries.
- AOS or Animate.css: Motion already owns reveal and interaction behavior.
- Swiper: use CSS scroll-snap or the lightbox unless a real carousel is required.
- React Icons: avoid shipping multiple icon families; use Lucide.
- Three.js / React Three Fiber: optional post-launch experiment only.
- A full CMS: local typed content is sufficient for V1.

---

## 4. Initialization

The project is a pnpm workspace with two packages: `client/` (Vite + React) and `server/` (Express).

```bash
# root
pnpm init
# pnpm-workspace.yaml: packages: [client, server]

# client
pnpm create vite@latest client -- --template react
pnpm --filter client add react-router-dom
pnpm --filter client add -D tailwindcss @tailwindcss/vite

# server
mkdir server && cd server && pnpm init
pnpm --filter server add express cors helmet dotenv
pnpm --filter server add -D nodemon supertest vitest

# shared dev tooling (client + server, added where relevant)
pnpm add -D -w vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @playwright/test \
  @axe-core/playwright eslint prettier concurrently
```

Later phases add `motion`, `gsap`, `@gsap/react`, `lenis`, `lucide-react`, `cmdk`, `react-hot-toast`, `react-hook-form`, `zod`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `class-variance-authority`, `yet-another-react-lightbox`, and `daisyui` to `client/` only, once the design system phase actually needs them. Do not install them during foundation work.

Package manager: **pnpm** only (no npm/yarn lockfiles).
Engine: define Node `>=22` in the root `package.json`.

---

## 5. Route architecture

Routes are configured with `react-router-dom`'s `createBrowserRouter`, in `client/src/routes/route-config.jsx`:

```jsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import WorkPage from "../pages/WorkPage";
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import AboutPage from "../pages/AboutPage";
import BeyondPage from "../pages/BeyondPage";
import ContactPage from "../pages/ContactPage";
import ResumePage from "../pages/ResumePage";
import NotFoundPage from "../pages/NotFoundPage";
import ErrorPage from "../pages/ErrorPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "work", element: <WorkPage /> },
      { path: "work/:slug", element: <ProjectDetailsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "beyond", element: <BeyondPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "resume", element: <ResumePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
```

Every route must define:

- Page title and metadata (via the shared document-head hook, since there is no framework route-metadata API in SPA mode).
- Route-level error behavior via the shared `errorElement`.
- Semantic page heading (`<h1>`).
- Scroll restoration behavior.
- Route-specific content data, sourced from `client/src/data/*.js`.

---

## 6. Folder structure

```text
portfolio/
├── client/
│   ├── public/
│   │   ├── icons/
│   │   ├── images/
│   │   ├── og/
│   │   └── resume/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── feedback/
│   │   │   ├── layout/
│   │   │   ├── media/
│   │   │   ├── navigation/
│   │   │   └── ui/
│   │   ├── data/
│   │   │   └── projects.js
│   │   ├── features/
│   │   │   ├── command-palette/
│   │   │   ├── contact/
│   │   │   ├── identity-mode/
│   │   │   ├── motion/
│   │   │   ├── photography/
│   │   │   └── projects/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── WorkPage.jsx
│   │   │   ├── ProjectDetailsPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── BeyondPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── routes/
│   │   │   └── route-config.jsx
│   │   ├── sections/
│   │   │   ├── about/
│   │   │   ├── beyond/
│   │   │   └── home/
│   │   ├── styles/
│   │   │   └── app.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── playwright.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── eslint.config.js
│   ├── package.json
│   ├── vitest.config.js
│   └── .env.example
│
├── docs/
├── .github/workflows/ci.yml
├── CLAUDE.md
├── pnpm-workspace.yaml
└── package.json
```

There is no `tsconfig.json`, `react-router.config.ts`, or root `vite.config.ts` — each of those belonged to the superseded Framework Mode architecture.

---

## 7. Component architecture

### UI primitives

- `Button`.
- `LinkButton`.
- `IconButton`.
- `Tag`.
- `SectionLabel`.
- `Surface`.
- `Container`.
- `TextLink`.
- `VisuallyHidden`.
- `SkipLink`.

### Layout

- `SiteHeader`.
- `MobileNavigation`.
- `SiteFooter`.
- `PageShell`.
- `Section`.
- `Grid`.
- `SignalRail`.

### Feature components

- `IdentityModeSwitch`.
- `CommandPalette`.
- `ProjectDossier`.
- `ProjectArchitecture`.
- `CapabilityMap`.
- `JourneyTimeline`.
- `BeyondPortal`.
- `PhotoContactSheet`.
- `ContactForm`.

### Component rules

- Prefer composition to giant prop objects.
- Do not build components until a second use case or clear design-system role exists.
- Avoid one file exceeding roughly 250–300 lines without a strong reason.
- No route should contain all of its sections inline.
- Keep content outside presentation components.
- Keep animation variants near the feature they affect, not in one global “animations.ts” file containing unrelated behavior.

---

## 8. Styling architecture

### Tailwind CSS 4

Use CSS-first tokens in `tokens.css`.

Conceptual direction:

```css
@theme {
  --font-sans: "Manrope Variable", system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;

  --color-canvas: #070a0d;
  --color-surface: #121922;
  --color-text: #f1f4f6;
  --color-muted: #aab4be;
  --color-signal: #b9ff46;

  --radius-panel: 1.25rem;
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Use root data attributes for identity modes:

```html
<html data-identity="system">
```

```css
:root[data-identity="system"] {
  /* professional tokens */
}

:root[data-identity="story"] {
  /* personal tokens */
}
```

### daisyUI policy

DaisyUI is allowed for:

- Drawer behavior.
- Tooltip patterns.
- Modal foundation.
- Accessible input-state utilities.

DaisyUI is not allowed to define the visible identity of:

- Hero buttons.
- Project cards.
- Navigation.
- Main form layout.
- Typography.
- Color palette.

Custom variants must wrap or override it. The final site should not be visually identifiable as a default daisyUI theme.

---

## 9. State management

Use the smallest state scope possible.

### Global state allowed

- Identity mode: SYSTEM or STORY.
- User motion override: system default, full, reduced.
- Command palette open state.

Use React context only when state is required across distant branches.

### Local state

- Form fields through React Hook Form.
- Lightbox index.
- Filter selection.
- Navigation drawer state.
- Media playback state.

Do not add Redux, Zustand, or a global event bus.

---

## 10. Contact form architecture

### Recommended static-site option

Use one external provider:

- Formspree, or
- Web3Forms with hCaptcha.

Do not use both.

### Validation

Zod schema:

- Name: 2–80 characters.
- Email: valid email.
- Organization: optional, max 120.
- Reason: enum.
- Message: 20–2000 characters.
- Honeypot must remain empty.

### Security and reliability

- Never put private email-service secret keys in client code.
- Provider access keys intended for client use must be restricted where possible.
- Add honeypot and CAPTCHA only where necessary.
- Add a mailto fallback.
- Disable repeated submit while pending.
- Keep an inline accessible status region.

---

## 11. SEO architecture

React 19 supports rendering `<title>`, `<meta>`, and `<link>` from route components. Use that native behavior unless React Router's route metadata API provides a clearer implementation in the generated template.

Every route must include:

```tsx
<title>Selected Work — Jahid Hasan</title>
<meta
  name="description"
  content="Case studies and web projects by Jahid Hasan..."
/>
<link rel="canonical" href="https://example.com/work" />
```

Also include:

- Open Graph metadata.
- Twitter/X card metadata.
- JSON-LD `Person` on home/about.
- JSON-LD `CreativeWork` or `SoftwareApplication` for projects where appropriate.
- `robots.txt`.
- `sitemap.xml` generated from static routes and project slugs.
- Favicons and web app manifest only if actually configured.
- Descriptive image alt text.

Do not add meaningless keyword stuffing.

---

## 12. Image architecture

### Asset rules

- Generate AVIF and WebP.
- Keep JPEG/PNG fallback only where needed.
- Define intrinsic width and height.
- Use `srcset` and `sizes` for large project and photography images.
- Lazy-load below-the-fold images.
- Do not lazy-load the LCP hero asset.
- Preload only the actual LCP asset.
- Use blur or dominant-color placeholders if implemented without excessive code.

### Recommended source dimensions

- Project cover master: 1800–2400 px wide.
- Project inline screenshot: 1400–1800 px wide.
- Photography master: preserve original, export responsive derivatives.
- OG image: 1200 × 630.

### Home-page image budgets

- LCP image: target ≤ 180 KB.
- Other individual home images: target ≤ 250 KB.
- Avoid loading full-resolution photography thumbnails.

---

## 13. Analytics

Optional for V1.

Preferred:

- Plausible, Umami, or platform analytics with minimal client cost.

Track only meaningful events:

- Project case-study open.
- Résumé download.
- Contact form success.
- GitHub/LinkedIn outbound click.
- Enter Beyond the Code.

Do not track cursor movement, sensitive form content, or unnecessary personal data.

---

## 14. Testing strategy

### Unit

- Data selectors and project lookup.
- Form schema.
- Metadata helpers.
- Clipboard helper.
- Motion-preference helper.

### Component/integration

- Header navigation.
- Mobile drawer keyboard behavior.
- Mode switch.
- Command palette search and actions.
- Project dossier links.
- Contact validation and status.
- Lightbox focus and close behavior.

### End-to-end

- All routes load directly.
- Home → case study → next project.
- SYSTEM → STORY → SYSTEM.
- Contact success and error mocks.
- Résumé link.
- 404 recovery.
- Keyboard-only critical journey.
- Reduced-motion journey.
- Mobile viewport journey.

### Accessibility automation

Run Axe in Playwright for:

- Home.
- Work.
- Project detail.
- About.
- Beyond.
- Contact.
- Command palette open.
- Mobile menu open.

Automation does not replace manual keyboard and screen-reader testing.

---

## 15. Continuous integration

GitHub Actions on pull request and main branch:

```text
install (frozen lockfile)
→ format check
→ lint (client + server)
→ unit/component tests (client)
→ unit/integration tests (server)
→ production build (client)
→ Playwright smoke tests (if stable)
```

There is no `typecheck` step — the project is JavaScript only.

Optional pre-deployment:

- Lighthouse CI.
- Broken-link check.
- Bundle-size check.

Root scripts (workspace-level):

```json
{
  "scripts": {
    "dev": "concurrently -k -n client,server \"pnpm dev:client\" \"pnpm dev:server\"",
    "dev:client": "pnpm --filter client dev",
    "dev:server": "pnpm --filter server dev",
    "build": "pnpm --filter client build",
    "lint": "pnpm --filter client lint && pnpm --filter server lint",
    "test": "pnpm test:client && pnpm test:server",
    "test:client": "pnpm --filter client test",
    "test:server": "pnpm --filter server test",
    "test:e2e": "pnpm --filter client test:e2e",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "pnpm format:check && pnpm lint && pnpm test && pnpm build",
    "check:full": "pnpm check && pnpm test:e2e"
  }
}
```

The server's production script is `pnpm --filter server start`, which runs `node src/server.js` directly — there is no server build/transpile step.

---

## 16. Deployment

### Recommended V1

The client and server deploy as two separate applications.

- **Client:** GitHub repository, static host (Vercel, Netlify, or Cloudflare Pages) serving the `client/` Vite build output, with an SPA rewrite rule (all paths → `index.html`) since there is no static pre-rendering. Custom domain, automatic preview deployments.
- **Server:** A Node.js-capable host (e.g. Render, Railway, Fly.io, or a VPS) running `pnpm --filter server start`. Not required until a feature (e.g. contact form) actually needs it live.

### Deployment checklist

- Environment variables configured on both client (`VITE_API_BASE_URL`) and server (`PORT`, `NODE_ENV`, `CLIENT_ORIGIN`, per `server/.env.example`).
- SPA fallback/rewrite rule configured on the client host so direct loads of nested routes resolve to `index.html`.
- Server CORS (`CLIENT_ORIGIN`) matches the deployed client origin exactly.
- Canonical domain enforced.
- HTTPS active on both client and server hosts.
- Security headers configured (Helmet on the server; host-level headers for the static client).
- Preview deployments set to noindex when possible.
- Contact form tested from production once implemented.
- Sitemap submitted after domain is final.

### Suggested security headers

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling unused capabilities.
- Content Security Policy after all external services are known.

Do not ship a copied generic CSP that breaks fonts, forms, images, or analytics.

---

## 17. Maintenance

Monthly:

- Test project links.
- Test form.
- Review dependency alerts.
- Check production errors.

Quarterly:

- Update résumé.
- Review current role positioning.
- Remove weak projects.
- Add meaningful project progress.
- Re-run performance and accessibility audit.

Before each job-search cycle:

- Update availability.
- Reorder featured projects for target roles.
- Validate project screenshots and case-study claims.
- Ensure GitHub pinned repositories match portfolio work.
