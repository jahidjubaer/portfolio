# 01 — Master Product and Design Specification

## 1. Document control

| Field | Value |
|---|---|
| Product | Jahid Hasan — Personal Portfolio |
| Version | 1.0 |
| Status | Ready for design and implementation |
| Primary audience | Recruiters and software engineering teams |
| Secondary audience | Collaborators, freelance clients, scholarship reviewers, and professional connections |
| Default language | English |
| Primary device strategy | Mobile-first, enhanced desktop experience |
| Primary role | Frontend Developer / Junior Software Engineer |
| Growth direction | Full-stack engineering and AI-enabled product development |

---

## 2. Product vision

Build a portfolio that proves Jahid can do more than assemble UI sections. The product must demonstrate:

1. **Product thinking** — clear visitor goals, intentional hierarchy, and low-friction navigation.
2. **Frontend engineering quality** — reusable components, responsive behavior, accessibility, performance, and reliable routing.
3. **Visual judgment** — distinctive art direction without sacrificing readability or credibility.
4. **Engineering communication** — projects explained through problems, decisions, trade-offs, architecture, and lessons.
5. **Human depth** — photography, leadership, sports, and volunteering shown in a separate but connected experience.

The desired result is not “a page containing all personal information.” It is a curated professional product that answers:

- Who is Jahid?
- What kind of engineer is he now?
- What has he built?
- How does he think?
- What is he learning next?
- How can someone contact or hire him?
- What makes him memorable beyond code?

---

## 3. Strategic positioning

### 3.1 Primary title

**Frontend Developer & Junior Software Engineer**

### 3.2 Supporting direction

**React-focused engineer expanding into full-stack systems and AI-enabled products.**

### 3.3 Recommended hero statement

> **I build clear interfaces for real product problems.**
>
> React-focused junior software engineer, growing toward complete full-stack and AI-enabled systems.

Alternative, more expressive version:

> **Turning product ideas into interfaces people can understand.**
>
> Frontend developer and junior software engineer working with React, modern JavaScript, and thoughtful interaction design.

### 3.4 Positioning boundaries

Do not present all of these as equal current specialties:

- Frontend Developer
- Full-Stack Engineer
- Software Engineer
- AI/ML Engineer
- Data Scientist
- Designer

That creates recruiter confusion. Use a three-level model:

| Level | Positioning |
|---|---|
| Current professional identity | Frontend Developer / Junior Software Engineer |
| Expanding capability | Node.js, Express, MongoDB, backend architecture |
| Long-term exploration | AI/ML and AI-enabled product engineering |

### 3.5 Credibility indicators

Only show verified, defensible evidence:

- BSc in Computer Science and Engineering, Metropolitan University.
- 250+ programming problems solved, primarily using C++.
- React and modern frontend projects.
- Full-stack project work through Sarabo.
- Leadership in university sports and photography organizations.
- Photography and event organization experience.

Do not display fake client counts, fake years of professional experience, fake satisfaction metrics, or vague “expert” labels.

---

## 4. Reference portfolio audit

### 4.1 Shahjalal Shohag

Observed strengths:

- Strong senior-engineer positioning around AI agents, RAG pipelines, full-stack systems, blockchain, and DeFi.
- Technical projects, research, competitive programming, and community leadership create evidence beyond a technology list.
- Professional authority comes from focused experience and proof.

Apply:

- Make technical work the center of the portfolio.
- Connect project output with engineering responsibility.
- Show competitive programming and leadership as supporting evidence.

Do not copy:

- Senior-level positioning or domain claims that do not match Jahid's present experience.

Audit limitation: the primary site is heavily client-rendered, so its full visual behavior could not be reliably inspected through the research crawler.

### 4.2 Ahmed Shamim

Observed strengths:

- Excellent one-sentence value proposition: direct, confident, and outcome-oriented.
- Content-first structure with work experience, writing, open source, and curated material.
- Strong evidence through real project descriptions, contribution metrics, and technical articles.
- Command-palette-style discovery supports power users without replacing conventional navigation.

Apply:

- Use concise, outcome-oriented copy.
- Give projects substance rather than relying on screenshots.
- Add a `Ctrl/Command + K` command palette as a secondary navigation method.
- Build a future-ready “Notes” section, but do not delay MVP for a blog.

Do not copy:

- Exact typography, layout, or written phrases.

### 4.3 Sumit Saha

Observed strengths:

- Broad but structured professional information architecture.
- Clear sections for work, education, projects, courses, talks, awards, community, and content.
- Deep credibility through external proof and a long-term body of work.

Apply:

- Build modular data models so new sections can be added later.
- Separate summary pages from detailed pages.
- Use a strong professional profile page rather than placing every detail on the home page.

Avoid:

- Reproducing the same volume of sections for a junior portfolio.
- Turning the home page into an exhaustive CV.

### 4.4 Harun Ur Roshid

Observed strengths:

- Energetic hero presentation.
- Work filters, project detail content, service cards, and clear calls to action.
- Visible use of animation and visually prominent projects.

Apply:

- Use bold project imagery and clear actions.
- Provide project filtering only when there are enough quality projects.
- Give each featured project a dedicated case-study page.

Avoid:

- Generic service descriptions.
- Empty or inflated counters.
- Excessive sections competing for attention.
- Treating every skill as a sellable professional service.

### 4.5 Shimanto Rehman

Observed strength:

- The professional identity combines full-stack software development and data-science interest.

Apply:

- It is possible to show a secondary technical direction without hiding it.

Avoid:

- Placing too many role labels in the hero.

Audit limitation: only limited metadata was available through the research crawler, so the visual design is not treated as a verified source.

### 4.6 Independent design conclusion

The new portfolio should combine:

- Ahmed Shamim's clarity and evidence.
- Sumit Saha's scalable information architecture.
- The showcase energy visible in more animated portfolios.
- A completely original dual-mode visual identity built around Jahid's professional and personal sides.

---

## 5. Original design concept: SYSTEM / STORY

### 5.1 Concept summary

The portfolio has two connected experiences.

#### SYSTEM

The default professional mode. It represents engineering, structure, product thinking, and technical work.

Visual language:

- Graphite canvas.
- Precise grid.
- High-contrast editorial typography.
- Thin technical rules and labels.
- Restrained “signal” accents.
- Structured, intentional animation.
- Project dossiers rather than generic cards.

#### STORY

The optional personal mode, reached through the visible **Beyond the Code** entry or the `/beyond` route. It represents photography, leadership, sports, volunteering, and life outside software.

Visual language:

- Warmer charcoal and soft ivory.
- Editorial photography layouts.
- Film-contact-sheet rhythm.
- More organic movement.
- Short personal stories instead of résumé language.

### 5.2 Why this concept is distinctive

- It solves the requirement for two sides without confusing recruiters.
- It creates a memorable interaction based on real personal identity.
- It is visually expressive without imitating a fake operating system.
- It gives photography a native design role instead of placing it in a generic gallery section.
- It creates an animation story with a clear purpose: changing from engineered structure to human narrative.

### 5.3 Mode navigation

Header action:

- `SYSTEM` — accessible label: “Professional portfolio”
- `STORY` — accessible label: “Beyond the code”

The mode control must not be the only way to navigate. `/beyond` must be reachable through a normal link and accessible to keyboard and screen-reader users.

### 5.4 Mode transition

Recommended transition:

1. Current content slightly contracts and fades.
2. A diagonal or circular mask reveals the alternate visual system.
3. Grid lines soften into image guides.
4. Accent color changes.
5. Content transitions to the target route.

Maximum transition duration: **650 ms**. Reduced-motion behavior: immediate route change with a 120–180 ms opacity fade.

---

## 6. Brand system

### 6.1 Brand name

Primary display:

**Jahid Hasan**

Monogram:

**JH.**

Optional technical signature:

**JH / SYSTEMS & INTERFACES**

Avoid labels such as “Code Wizard,” “Ninja,” “Rockstar,” or “Digital Magician.”

### 6.2 Brand personality

- Precise
- Curious
- Reliable
- Modern
- Product-oriented
- Visually aware
- Honest about current level
- Ambitious without exaggeration

### 6.3 Voice and copy rules

Use:

- Short active sentences.
- Specific responsibilities.
- Measurable evidence when available.
- “Built,” “designed,” “implemented,” “improved,” “learned,” and “decided.”

Avoid:

- “I am passionate about technology” without evidence.
- “I am an expert in…”
- “Creating digital magic.”
- Long lists of technologies in paragraph form.
- Generic claims about quality, scalability, or innovation.

---

## 7. Visual design system

### 7.1 Color direction

#### SYSTEM palette

| Token | Suggested value | Usage |
|---|---:|---|
| Canvas | `#070A0D` | Main background |
| Elevated canvas | `#0D1218` | Panels and navigation |
| Surface | `#121922` | Project media and cards |
| Primary text | `#F1F4F6` | Headlines and important copy |
| Secondary text | `#AAB4BE` | Body text |
| Muted text | `#6F7B86` | Metadata |
| Signal | `#B9FF46` | Primary accent and active state |
| Data | `#71D7FF` | Secondary technical accent |
| Warning | `#FFB86B` | Limited status usage |
| Rule | `rgba(255,255,255,.12)` | Borders and grid |

#### STORY palette

| Token | Suggested value | Usage |
|---|---:|---|
| Canvas | `#151310` | Warm dark background |
| Paper | `#EEE8DC` | High-contrast editorial blocks |
| Ink | `#171513` | Text on paper surfaces |
| Warm text | `#D9D0C4` | Body text |
| Ember | `#FF6B3D` | Primary personal accent |
| Gold | `#E7B75F` | Secondary accent |
| Rule | `rgba(238,232,220,.17)` | Borders and guides |

The final palette requires visual testing. Accent colors should occupy less than 10–15% of the page.

### 7.2 Typography

Recommended pair:

- **Manrope Variable** — headings and body.
- **JetBrains Mono Variable** — labels, metadata, routes, project numbers, keyboard shortcuts.

Alternative:

- Geist Sans + Geist Mono.

Rules:

- One display family and one mono family only.
- Body line length: 55–75 characters.
- Minimum body size: 16 px.
- Mobile hero: use `clamp()` rather than fixed oversized text.
- Avoid all-uppercase body copy.
- Uppercase is reserved for metadata and small labels.

### 7.3 Type scale

| Token | Suggested responsive size |
|---|---|
| Display XL | `clamp(3.2rem, 8vw, 8.5rem)` |
| Display L | `clamp(2.5rem, 6vw, 6rem)` |
| H1 | `clamp(2.25rem, 5vw, 5rem)` |
| H2 | `clamp(1.8rem, 3.6vw, 3.6rem)` |
| H3 | `clamp(1.35rem, 2vw, 2rem)` |
| Body L | `clamp(1.05rem, 1.4vw, 1.3rem)` |
| Body | `1rem` |
| Label | `.75rem–.875rem` |

### 7.4 Layout grid

- Desktop: 12 columns.
- Tablet: 6 columns.
- Mobile: 4 columns.
- Maximum content width: 1280 px.
- Full-bleed visual width: 1440–1600 px where appropriate.
- Outer gutters: 20 px mobile, 32 px tablet, 48–72 px desktop.
- Section vertical rhythm: 96–160 px desktop, 72–104 px mobile.

### 7.5 Surfaces

Use three surface types:

1. **Canvas** — uninterrupted content and large typography.
2. **Technical panel** — thin border, low contrast, small metadata.
3. **Media plane** — image/video surface with minimal decoration.

Avoid applying glassmorphism to every card. Blur is reserved for the sticky navigation and command palette.

### 7.6 Shape language

- Primary radius: 18–24 px.
- Small radius: 10–14 px.
- Pills only for compact status tags.
- Buttons should not all be pills.
- Borders: 1 px with subtle contrast.
- Shadows: minimal; use light and depth selectively.

### 7.7 Image treatment

Professional mode:

- Clean project mockups.
- Neutral or project-specific background blocks.
- Screenshots cropped around real workflows.
- Optional device frames only when useful.

Personal mode:

- Photography displayed edge-to-edge or in contact-sheet groups.
- Preserve original aspect ratios.
- Use light film grain as a static texture.
- Do not bury photos under strong overlays.

---

## 8. Signature interactions

### 8.1 Command palette

Shortcut: `Ctrl/Command + K`

Actions:

- Go Home
- View Work
- Open About
- Open Beyond the Code
- Contact Jahid
- Download Résumé
- Open GitHub
- Open LinkedIn
- Copy email address
- Toggle motion preference

The command palette is enhancement, not the primary navigation.

### 8.2 Project dossier

Featured projects are presented as “dossiers”:

- Large project index: `01`, `02`, `03`.
- Project category and year.
- One-line problem statement.
- Primary contribution.
- Stack summary.
- Large image or short muted preview.
- “Read case study” action.

Hover behavior must reveal additional metadata without hiding required information.

### 8.3 Engineering signal rail

Desktop-only optional feature:

- A thin fixed or sticky left rail showing current section.
- Scroll progress.
- Current route label.
- System/Story state.

Mobile replacement: compact progress line under the header.

### 8.4 Beyond portal

Near the end of the professional home page, show a high-impact personal preview:

> There is more behind the interface.

A photographic portal reveals part of the STORY palette on hover or focus. Clicking navigates to `/beyond`.

### 8.5 Skill constellation

Skills are not percentage bars. Use a structured capability map:

- **Use now** — React, JavaScript, HTML, CSS, Tailwind, Git.
- **Building depth** — TypeScript, Node.js, Express, MongoDB, testing, system design.
- **Exploring** — AI/ML, Python data workflows, AI-enabled products.

Desktop may use a lightweight interactive map. Mobile must use a normal accessible list.

---

## 9. Page specifications

## 9.1 Home — `/`

### Goal

In under 30 seconds, a recruiter should understand Jahid's role, strongest project evidence, technical direction, and how to contact him.

### Sections

1. **Header**
   - JH. monogram.
   - Home, Work, About, Beyond, Contact.
   - Résumé action.
   - Command-palette trigger.

2. **Hero**
   - Primary title and value proposition.
   - Current role.
   - Availability state.
   - View Work and Contact actions.
   - Compact technical status panel.

3. **Proof strip**
   - CSE graduate.
   - 250+ problems solved.
   - React-focused development.
   - Full-stack project experience.

4. **Featured work**
   - Three project dossiers.
   - Recommended initial order:
     1. Sarabo.
     2. Jahid Worlds or the strongest verified production-style project.
     3. Bang Learner.
   - Final order depends on asset and repository quality.

5. **Engineering approach**
   - Understand the problem.
   - Build clear component systems.
   - Test across devices and edge cases.

6. **Capability map**
   - Current, developing, exploring.

7. **Journey snapshot**
   - C/C++ and problem solving.
   - CSE degree.
   - Web development transition.
   - React and full-stack growth.

8. **Beyond portal**
   - Photography image preview.
   - Leadership and sports tags.

9. **Contact CTA**
   - “Let’s build something clear, useful, and reliable.”

10. **Footer**
   - Email, GitHub, LinkedIn.
   - Sitemap.
   - Current local time optional; do not make it a dependency.

### Hero content recommendation

Eyebrow:

`JAHID HASAN / FRONTEND DEVELOPER`

Headline:

> I build clear interfaces for real product problems.

Supporting copy:

> CSE graduate and junior software engineer working with React and modern frontend tools, while expanding into full-stack systems and AI-enabled products.

Primary CTA: `View selected work`  
Secondary CTA: `Start a conversation`

---

## 9.2 Work index — `/work`

### Goal

Show selected quality work first, then a concise archive of experiments and learning projects.

### Structure

- Page statement.
- Featured case studies.
- Filterable archive only when at least six meaningful projects exist.
- Filters: Featured, Frontend, Full-stack, Academic, Experiments.
- Project status: Live, Completed, In progress, Archived.

### Project-card information

- Title.
- One-line problem.
- Role.
- Year.
- Stack, limited to 3–5 primary tools.
- Live link if working.
- Repository link if presentation-ready.
- Case-study link.

Do not expose weak, empty, or unfinished repositories merely to increase project count.

---

## 9.3 Project case study — `/work/:slug`

### Goal

Demonstrate engineering thought, not just visual output.

### Required sections

1. Project hero.
2. Problem and context.
3. Users and use case.
4. Jahid's role and responsibility.
5. Scope, team, and timeline.
6. Key features.
7. User flow.
8. Technical architecture.
9. Important engineering decisions.
10. Challenges and solutions.
11. Accessibility and responsiveness.
12. Screenshots or short video.
13. Result and current status.
14. What was learned.
15. What would be improved next.
16. Live and repository links.
17. Next project navigation.

### Architecture visual

Use an SVG or semantic HTML diagram. Do not use a large bitmap diagram. It must remain readable on mobile.

### Recommended first case study: Sarabo

Sarabo is suitable as the flagship case study because it has:

- Multiple user roles.
- Repair-request lifecycle.
- Authentication.
- Admin and technician workflows.
- Payment flow.
- Tracking.
- Separate frontend and backend.
- Transaction and security considerations.

---

## 9.4 About — `/about`

### Goal

Explain Jahid's engineering journey, mindset, capabilities, education, and leadership without reading like a copied CV.

### Sections

- Short biography.
- Professional principles.
- Capability map.
- Current learning focus.
- Timeline.
- Education.
- Competitive programming.
- Leadership and university activities.
- Résumé download.

### Recommended biography direction

> I am a CSE graduate focused on frontend development and junior software engineering. My foundation in C++, data structures, algorithms, and object-oriented programming shapes how I approach web applications: understand the problem, break it into systems, and build the interface around real user needs. I currently work primarily with React and modern JavaScript, while developing deeper backend and AI/ML capabilities.

This copy should be refined after the final project and career details are confirmed.

---

## 9.5 Beyond the Code — `/beyond`

### Goal

Show the human side without weakening the professional message.

### Sections

1. STORY hero.
2. Photography contact sheet.
3. Selected photo stories.
4. Sports and cricket.
5. Leadership and event organization.
6. Volunteering.
7. Personal values or short field notes.
8. Return to SYSTEM.

### Photography experience

- Category filters: Street, Event, Sports, Nature, Portrait, or only verified categories.
- Lightbox with keyboard support.
- Image metadata optional: title, location, year, story.
- Lazy load all below-the-fold images.
- Use responsive image sizes.

### Story tone

Personal, concise, reflective. Avoid turning hobbies into fake professional services.

---

## 9.6 Contact — `/contact`

### Goal

Make professional contact fast and trustworthy.

### Content

- Availability status.
- Target roles.
- Preferred work format and location.
- Email.
- LinkedIn and GitHub.
- Contact form.
- Expected response language: English or Bangla.

### Form fields

- Name.
- Email.
- Organization, optional.
- Reason: Job opportunity, project, collaboration, other.
- Message.
- Consent/confirmation.
- Hidden honeypot.

### States

- Idle.
- Validating.
- Submitting.
- Success.
- Error with retry.

Use toast notification as supplemental feedback; preserve an inline status message for accessibility.

---

## 9.7 Résumé — `/resume`

Recommended behavior:

- Show a short HTML résumé summary.
- Provide a PDF download button.
- Do not embed a heavy PDF viewer by default.
- Include last-updated date.

---

## 9.8 404 — `*`

Concept:

`SIGNAL LOST / ROUTE NOT FOUND`

Actions:

- Return home.
- Open command palette.
- View work.

Do not make the 404 animation longer than the recovery action.

---

## 10. Responsive behavior

### Mobile

- Standard navigation drawer.
- No custom cursor.
- No pinned horizontal scroll.
- No hover-dependent information.
- Project media becomes normal vertical flow.
- Mode transition simplified.
- Touch targets at least 44 × 44 px.

### Tablet

- Maintain strong grid but avoid oversized desktop typography.
- Project layouts may alternate media/text.

### Desktop

- Enable command palette shortcuts.
- Optional signal rail.
- Enhanced hover states.
- Selective pinned or layered project sequence.
- Smooth-scroll enhancement where permitted.

---

## 11. Explicit anti-patterns

The implementation must not include:

- Generic purple-and-blue gradient as the primary identity.
- Constant role-changing typewriter text.
- A fake terminal as the main hero.
- Matrix/code-rain backgrounds.
- Percentage skill bars.
- Fake years, clients, projects, or satisfaction counters.
- Every UI element using glassmorphism.
- Autoplay audio.
- A multi-second preloader on every visit.
- Heavy WebGL only to appear modern.
- Scroll hijacking that breaks expected browser behavior.
- Hidden navigation that requires discovering an Easter egg.
- Multiple toast libraries.
- Both Motion and GSAP controlling the same element/property.
- Large unoptimized photography assets.
- A technology logo cloud without meaningful structure.
- Copying the provided references' layouts, wording, or visual identity.

---

## 12. Product success criteria

### Recruiter outcome

A recruiter can identify the role, strongest work, education, and contact path within 30 seconds.

### Engineering outcome

A technical reviewer can inspect at least two detailed case studies and understand Jahid's contribution, architecture, and decisions.

### Visual outcome

The site has an original and consistent art direction across desktop and mobile.

### Personal outcome

The personal side is clearly discoverable but never blocks the professional journey.

### Quality outcome

- Lighthouse targets: 95+ Accessibility, 95+ SEO, 90+ Performance on production mobile tests.
- Core Web Vitals target: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile.
- All interactions available by keyboard.
- Reduced-motion mode fully supported.
- No route fails on direct load.
- No console errors in production.

---

## 13. Decisions requiring Jahid's confirmation

The specification can be implemented now with placeholders, but final launch requires confirmation of:

1. Final hero headline.
2. Exact professional title and job availability.
3. Three featured projects.
4. Whether CGPA should be displayed.
5. Professional and personal photos.
6. Public email and social links.
7. Contact-form provider.
8. Domain and deployment platform.
9. Final résumé PDF.
10. Photography categories and selected images.

Until confirmed, use clearly marked local placeholder data—not invented claims.
