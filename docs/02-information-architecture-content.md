# 02 — Information Architecture and Content Specification

## 1. Sitemap

```text
/
├── /work
│   └── /work/:slug
├── /about
├── /beyond
│   └── /beyond/photography        [optional V1.1]
├── /contact
├── /resume
├── /notes                         [future]
│   └── /notes/:slug               [future]
└── *                              [404]
```

## 2. Primary navigation

Desktop:

```text
JH.   Work   About   Beyond   Contact          Résumé   ⌘K
```

Mobile:

```text
JH.                                  Menu
```

Drawer order:

1. Home.
2. Work.
3. About.
4. Beyond the Code.
5. Contact.
6. Résumé.
7. GitHub.
8. LinkedIn.

Navigation must use real links. Do not implement primary navigation as buttons with imperative routing.

---

## 3. Content priority

### Tier 1 — required for first release

- Name and title.
- Hero positioning.
- Three featured projects.
- About summary.
- Skills/capability map.
- Education.
- Problem-solving evidence.
- Contact details.
- Résumé.
- Personal-side preview.

### Tier 2 — required for polished launch

- Detailed Sarabo case study.
- Detailed second project case study.
- Professional photo.
- Photography gallery.
- Leadership timeline.
- Social metadata and custom OG images.

### Tier 3 — post-launch

- Technical notes/blog.
- Live GitHub statistics.
- Search.
- CMS.
- Dynamic analytics dashboard.
- WebGL experiment.

---

## 4. Recommended project curation

### Featured

#### 1. Sarabo

Positioning:

> A multi-role home-repair platform that connects customers, approved technicians, and administrators through request, assignment, tracking, and payment workflows.

Evidence to cover:

- React frontend.
- Express/MongoDB API.
- Firebase authentication.
- Customer, technician, and admin roles.
- Repair-request lifecycle.
- Public tracking.
- Stripe payment flow.
- Server-state management.
- Transaction-safe operations.

#### 2. Jahid Worlds — pending verification

Positioning direction:

> A point-of-sale shopping experience built around product browsing, cart management, payment, and operational workflows.

Before featuring, verify:

- Repository.
- Live URL.
- Final stack.
- Current functionality.
- Screenshots.
- Jahid's individual contribution.

#### 3. Bang Learner

Positioning:

> A local skill-exchange platform where users can discover skills, authenticate, manage profiles, and book learning sessions.

Evidence to cover:

- React.
- React Router.
- Firebase authentication and hosting.
- Protected routes.
- Responsive design.
- Form validation.
- Session booking.

### Project archive candidates

- Note Bank.
- Blood Donation Application.
- Dragon News.
- Boi Poka.
- BPL Dream XL.
- Emergency Hotline.
- Programming and academic repositories.

Only include archive projects with working code, honest descriptions, and at least one useful learning point.

---

## 5. Content-writing framework for projects

Every case study should answer:

1. **Context** — Why did this project exist?
2. **Problem** — What user or system problem was addressed?
3. **Role** — What exactly did Jahid own?
4. **Constraints** — Time, team, technology, or requirements.
5. **Approach** — How was the problem decomposed?
6. **Decisions** — Why were key technologies or patterns chosen?
7. **Challenges** — What failed or became difficult?
8. **Resolution** — How was it fixed?
9. **Result** — What now works?
10. **Reflection** — What would be improved with more time?

### Weak copy

> This is a modern application built with React, Tailwind, and Firebase.

### Stronger copy

> I separated authentication state from route authorization so public pages could load immediately while protected dashboards waited for the user's role. This prevented unauthorized content flashes and reduced duplicated route logic.

Only use the stronger version when it is factually true.

---

## 6. Typed data models

Use local, typed content for V1. This keeps the project fast, testable, and easy for Claude Code to maintain.

### 6.1 Project model

```ts
export type ProjectStatus = "live" | "completed" | "in-progress" | "archived";
export type ProjectCategory =
  | "frontend"
  | "full-stack"
  | "academic"
  | "experiment";

export interface ProjectLink {
  label: "Live" | "Client" | "Server" | "Documentation" | "Video";
  href: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface ProjectDecision {
  title: string;
  context: string;
  decision: string;
  tradeOff: string;
}

export interface Project {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
  year: number;
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  order: number;
  stack: string[];
  responsibilities: string[];
  features: string[];
  challenges: Array<{
    title: string;
    problem: string;
    response: string;
  }>;
  decisions: ProjectDecision[];
  architecture?: string[];
  outcome?: string[];
  learnings: string[];
  nextSteps: string[];
  cover: ProjectImage;
  gallery: ProjectImage[];
  links: ProjectLink[];
}
```

### 6.2 Capability model

```ts
export type CapabilityLevel = "use-now" | "building-depth" | "exploring";

export interface Capability {
  name: string;
  level: CapabilityLevel;
  category:
    | "frontend"
    | "backend"
    | "language"
    | "database"
    | "tooling"
    | "computer-science"
    | "ai-ml";
  evidence?: string;
}
```

No numeric percentages.

### 6.3 Timeline model

```ts
export interface TimelineEntry {
  id: string;
  period: string;
  title: string;
  organization?: string;
  description: string;
  type: "education" | "project" | "leadership" | "learning";
  highlights?: string[];
}
```

### 6.4 Photography model

```ts
export interface PhotoStory {
  id: string;
  src: string;
  thumbnailSrc: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  category: string;
  year?: number;
  location?: string;
  story?: string;
  featured?: boolean;
}
```

### 6.5 Social-link model

```ts
export interface SocialLink {
  platform: "GitHub" | "LinkedIn" | "Email" | "Codeforces" | "LeetCode";
  href: string;
  label: string;
  public: boolean;
}
```

---

## 7. Route-level content plan

## 7.1 Home content map

| Section | Required data | Primary action |
|---|---|---|
| Hero | Name, title, statement, availability | View work |
| Proof | Education, problem count, focus | About |
| Featured work | 3 projects | Case study |
| Approach | 3 principles | About |
| Capabilities | Current/developing/exploring | Résumé |
| Journey | 4–6 milestones | Full About |
| Beyond | 1 strong image, 3 themes | Enter Story |
| Contact | Email and role interest | Send message |

## 7.2 Work page content map

| Section | Content |
|---|---|
| Intro | What Jahid builds and what is selected |
| Featured | 2–3 detailed projects |
| Archive | Compact project table/grid |
| GitHub note | Link to wider repository history |
| CTA | Contact or résumé |

## 7.3 About content map

| Section | Content |
|---|---|
| Intro | 120–180 word biography |
| Principles | 3–4 engineering principles |
| Capabilities | Evidence-based skills |
| Current focus | React depth, backend, system design, AI/ML |
| Timeline | Education and development journey |
| Leadership | Sports club, photographic society, cricket, volunteering |
| Résumé | Download and last updated |

## 7.4 Beyond content map

| Section | Content |
|---|---|
| Hero | Personal statement and photograph |
| Photography | 12–30 selected photographs |
| Sports | Cricket and team leadership |
| Organizing | Events and university roles |
| Volunteering | Scouts, Red Crescent, or confirmed activities |
| Return | Link back to professional portfolio |

---

## 8. Suggested copy inventory

### Home eyebrow

`FRONTEND DEVELOPER / JUNIOR SOFTWARE ENGINEER`

### Availability badge

Use one verified state:

- `Open to junior frontend roles`
- `Open to frontend and software engineering opportunities`
- `Currently focused on building and learning`

### Engineering principles

#### Understand before building

I clarify the user, workflow, and constraints before choosing components or packages.

#### Keep interfaces explainable

I prefer clear state, reusable components, and predictable interaction over unnecessary complexity.

#### Improve through evidence

I test across devices, inspect edge cases, and document what I would change next.

### Beyond teaser

> Code explains how I solve problems. Photography, sports, and organizing explain how I observe, lead, and work with people.

### Contact CTA

> Have a junior frontend role, software project, or collaboration in mind? Send the context and I will respond with a clear next step.

---

## 9. SEO content requirements

Each route needs unique:

- `<title>`.
- Meta description.
- Canonical URL.
- Open Graph title and description.
- Open Graph image.
- Twitter/X card metadata.

Examples:

### Home

Title:

`Jahid Hasan — Frontend Developer & Junior Software Engineer`

Description:

`Portfolio of Jahid Hasan, a CSE graduate and React-focused frontend developer building modern web products and expanding into full-stack and AI-enabled engineering.`

### Work

Title:

`Selected Work — Jahid Hasan`

Description:

`Case studies and web projects by Jahid Hasan, covering React interfaces, authentication, multi-role workflows, full-stack systems, and responsive product development.`

### Beyond

Title:

`Beyond the Code — Jahid Hasan`

Description:

`Photography, sports, leadership, volunteering, and personal work by Jahid Hasan.`

---

## 10. Content governance

- All public facts must be backed by a résumé, repository, certificate, or Jahid's confirmation.
- Dates must use one consistent format.
- Project status must be updated when demos stop working.
- Remove broken live links rather than leaving them visible.
- Update the résumé date whenever the PDF changes.
- Review all content every three months.
- Photography alt text must describe the image, not repeat the file name.
- Do not expose private email, phone, addresses, API keys, or private repository details without explicit approval.
