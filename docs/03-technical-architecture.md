# 03 — Technical Architecture Specification

## 1. Architecture decision

Use **React Router Framework Mode** with **static pre-rendering**.

Why:

- Maintains a React-first stack.
- Supports route modules, automatic code splitting, loaders, error boundaries, and typed routes.
- Produces static HTML for SEO and fast first loads.
- Can deploy to static hosting without a permanent application server.
- Leaves a path to SSR later without rewriting the whole routing architecture.

### Baseline

As of 5 August 2026:

- React 19.
- React Router 8.x Framework Mode.
- Vite 7+ baseline required by React Router 8.
- Node.js 22+.
- TypeScript strict mode.
- Tailwind CSS 4.
- daisyUI 5, used selectively.

Use the latest mutually compatible stable package versions during implementation. Do not hard-code old versions merely because they appear in this document.

---

## 2. Rendering strategy

Recommended `react-router.config.ts` direction:

```ts
import type { Config } from "@react-router/dev/config";
import { projects } from "./app/data/projects";

export default {
  ssr: false,
  async prerender() {
    return [
      "/",
      "/work",
      "/about",
      "/beyond",
      "/contact",
      "/resume",
      ...projects.map((project) => `/work/${project.slug}`),
    ];
  },
} satisfies Config;
```

Requirements:

- All public routes must be pre-rendered.
- Dynamic project paths must be generated from project data.
- Static host must serve the SPA fallback for unknown client routes while preserving generated HTML for pre-rendered paths.
- Directly loading `/work/sarabo` must not return 404.

---

## 3. Package strategy

### 3.1 Core

| Package | Purpose | Decision |
|---|---|---|
| `react` / `react-dom` | UI runtime | Required |
| `react-router` | Routing and framework features | Required |
| `typescript` | Type safety | Required |
| `tailwindcss` | Styling and design tokens | Required |
| `@tailwindcss/vite` | Tailwind Vite integration | Required |
| `daisyui` | Selected accessible patterns and semantic utilities | Selective |

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

Recommended commands:

```bash
pnpm dlx create-react-router@latest jahid-portfolio
cd jahid-portfolio

pnpm add motion gsap @gsap/react lenis \
  lucide-react cmdk react-hot-toast \
  react-hook-form zod @hookform/resolvers \
  clsx tailwind-merge class-variance-authority \
  yet-another-react-lightbox

pnpm add -D tailwindcss @tailwindcss/vite daisyui \
  vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @playwright/test \
  @axe-core/playwright eslint prettier
```

Before installing, inspect the generated template and avoid adding packages already present.

Package manager: **pnpm**.  
Engine: define Node `>=22` in `package.json`.

---

## 5. Route architecture

Suggested `app/routes.ts`:

```ts
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("work", "routes/work/index.tsx"),
  route("work/:slug", "routes/work/detail.tsx"),
  route("about", "routes/about.tsx"),
  route("beyond", "routes/beyond.tsx"),
  route("contact", "routes/contact.tsx"),
  route("resume", "routes/resume.tsx"),
  route("*", "routes/not-found.tsx"),
];
```

Every route must define:

- Page title and metadata.
- Route-level error behavior where relevant.
- Semantic page heading.
- Scroll restoration behavior.
- Route-specific content data.

---

## 6. Folder structure

```text
jahid-portfolio/
├── app/
│   ├── assets/
│   │   ├── images/
│   │   ├── projects/
│   │   ├── photography/
│   │   └── textures/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── feedback/
│   │   └── media/
│   ├── features/
│   │   ├── command-palette/
│   │   ├── identity-mode/
│   │   ├── contact/
│   │   ├── projects/
│   │   ├── photography/
│   │   └── motion/
│   ├── routes/
│   │   ├── home.tsx
│   │   ├── about.tsx
│   │   ├── beyond.tsx
│   │   ├── contact.tsx
│   │   ├── resume.tsx
│   │   ├── not-found.tsx
│   │   └── work/
│   │       ├── index.tsx
│   │       └── detail.tsx
│   ├── sections/
│   │   ├── home/
│   │   ├── about/
│   │   └── beyond/
│   ├── data/
│   │   ├── profile.ts
│   │   ├── projects.ts
│   │   ├── capabilities.ts
│   │   ├── timeline.ts
│   │   ├── leadership.ts
│   │   ├── photography.ts
│   │   └── navigation.ts
│   ├── hooks/
│   │   ├── use-copy-to-clipboard.ts
│   │   ├── use-media-query.ts
│   │   ├── use-motion-preference.ts
│   │   └── use-page-visibility.ts
│   ├── lib/
│   │   ├── cn.ts
│   │   ├── metadata.ts
│   │   ├── analytics.ts
│   │   ├── forms.ts
│   │   └── structured-data.ts
│   ├── styles/
│   │   ├── app.css
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   ├── utilities.css
│   │   └── reduced-motion.css
│   ├── root.tsx
│   └── routes.ts
├── public/
│   ├── resume/
│   ├── og/
│   ├── icons/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── _redirects                  [when deploying to Netlify/static host]
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── CLAUDE.md
├── react-router.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

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
install
→ lint
→ typecheck
→ unit tests
→ production build
→ Playwright smoke tests
```

Optional pre-deployment:

- Lighthouse CI.
- Broken-link check.
- Bundle-size check.

Required scripts:

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
    "typecheck": "react-router typegen && tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

Adjust `start` when deploying as a purely static build.

---

## 16. Deployment

### Recommended V1

- GitHub repository.
- Vercel or Cloudflare Pages.
- Static pre-rendered build.
- Custom domain.
- Automatic preview deployments.

### Deployment checklist

- Environment variables configured.
- Direct-route fallback configured.
- Canonical domain enforced.
- HTTPS active.
- Security headers configured.
- Preview deployments set to noindex when possible.
- Contact form tested from production.
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
