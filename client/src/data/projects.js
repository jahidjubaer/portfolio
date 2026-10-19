import { assertValidProjects } from "./project-schema";

/**
 * Verified project entries — see CONTENT_CHECKLIST.md section 7. Every
 * field must trace back to a confirmed checklist fact. Unverified facts
 * (exact role, timeline, repositories not yet public, challenges,
 * outcomes, screenshots) are omitted rather than invented; see each
 * project's `missingContent` list for what is still outstanding.
 *
 * @typedef {{ label: string, url: string | null, type: "live" | "repository" | "documentation" }} ProjectLink
 * @typedef {{
 *   id: string,
 *   heading: string,
 *   type: "text" | "gallery",
 *   body?: string,
 * }} CaseStudySection  `body` is Markdown; a gallery section has none.
 * @typedef {{
 *   role?: string,
 *   timeline?: string,
 *   sections: CaseStudySection[],
 *   gallery?: { file: string, caption: string }[],
 * }} CaseStudy
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   projectType: string,
 *   status: "live" | "repository-available" | "private" | "archived",
 *   featured: boolean,
 *   stack: string[],
 *   capabilities: string[],
 *   links: ProjectLink[],
 *   caseStudyStatus: "complete" | "in-preparation" | "none",
 *   caseStudy: CaseStudy | null,
 *   roleContext?: string,
 *   relatedSlugs: string[],
 *   seo: { title: string, description: string },
 *   missingContent: string[],
 * }} Project
 */

const SARABO_CAPABILITIES = [
  "Authentication and role-based access",
  "Repair-request lifecycle tracking",
  "Technician assignment",
  "Quotation management",
  "Notifications",
  "Customer reviews",
  "Stripe payment flow",
];

// Captions for currently known Sarabo screenshots — matched to the asset
// manifest's detected gallery files by filename. Any future screenshot the
// manifest detects without an entry here falls back to a neutral generic
// caption in ProjectMediaGallery rather than an invented one.
const SARABO_GALLERY = [
  { file: "screenshot-01.webp", caption: "Sarabo administrator dashboard" },
  { file: "screenshot-02.webp", caption: "Sarabo home interface" },
  { file: "screenshot-03.webp", caption: "Sarabo mobile view" },
  { file: "screenshot-04.webp", caption: "Sarabo payment interface" },
  { file: "screenshot-05.webp", caption: "Sarabo repair-request flow" },
  { file: "screenshot-06.webp", caption: "Sarabo technician dashboard" },
  { file: "screenshot-07.webp", caption: "Sarabo tracking interface" },
  { file: "screenshot-08.webp", caption: "Sarabo customer dashboard" },
];

/** @type {Project[]} */
const rawProjects = [
  {
    slug: "sarabo",
    title: "Sarabo",
    summary:
      "A multi-role electronics-repair service platform that helps customers request repairs and track service progress while technicians and administrators manage the repair lifecycle.",
    projectType: "Full-stack web application",
    status: "live",
    featured: true,
    stack: ["React", "Node.js", "Express", "MongoDB", "Firebase", "Stripe"],
    capabilities: SARABO_CAPABILITIES,
    links: [
      {
        label: "Live client",
        url: "https://sarabo-jahid.web.app",
        type: "live",
      },
      {
        label: "Live API",
        url: "https://sarabo-server.vercel.app",
        type: "live",
      },
      {
        // Public repositories verified via the GitHub API (client
        // 2026-09-29, server made public and confirmed 2026-10-18).
        label: "Client repository",
        url: "https://github.com/jahidjubaer/sarabo-client",
        type: "repository",
      },
      {
        label: "Server repository",
        url: "https://github.com/jahidjubaer/sarabo-server",
        type: "repository",
      },
    ],
    caseStudyStatus: "complete",
    caseStudy: {
      role: "Sole Developer",
      timeline: "July–August",
      gallery: SARABO_GALLERY,
      sections: [
        {
          id: "overview",
          heading: "Overview",
          type: "text",
          body: `Sarabo is a multi-role electronics-repair service platform. Customers submit repair requests and track progress; technicians manage assigned repairs; administrators oversee accounts, requests, and technician assignment across the platform.

This was a solo project. Jahid was responsible for the end-to-end development of the client and server applications.`,
        },
        {
          id: "roles",
          heading: "Roles",
          type: "text",
          body: `- **Customer** — Submits repair requests, tracks progress, reviews quotations, pays through Stripe, and leaves reviews.
- **Technician** — Receives assigned repair requests and updates their progress through the repair lifecycle.
- **Administrator** — Manages accounts and repair requests, and assigns technicians across the platform.`,
        },
        {
          id: "workflow",
          heading: "Workflow",
          type: "text",
          body: "Sarabo supports a repair-request lifecycle covering service selection, request submission, quotation and review, assignment-related handling, progress tracking and payment-related states.",
        },
        {
          id: "capabilities",
          heading: "Capabilities",
          type: "text",
          body: SARABO_CAPABILITIES.map((item) => `- ${item}`).join("\n"),
        },
        { id: "gallery", heading: "Gallery", type: "gallery" },
        {
          id: "architecture",
          heading: "Architecture",
          type: "text",
          body: `- **React client** — The customer, technician, and administrator interfaces.
- **Firebase authentication** — Handles sign-in and role-based access across the client.
- **Express API** — A Node.js and Express API deployed separately from the client, handling repair-request, quotation, and role logic.
- **MongoDB** — Persists repair requests, quotations, roles, and reviews.
- **Stripe** — Processes customer payments for completed quotations.`,
        },
        {
          id: "decisions",
          heading: "Implementation approach",
          type: "text",
          body: `- The React client and the Express API are deployed separately — the client via Firebase Hosting, the API on its own deployment.
- Firebase handles authentication while a custom Express and MongoDB API manages repair-request, quotation, and role data.`,
        },
        {
          id: "reflection",
          heading: "Challenge, outcome and reflection",
          type: "text",
          body: `**Challenge:** Validation was one of the main implementation challenges during development. Detailed notes about the specific validation cases and the final solution are still being documented.

**Outcome:** The project resulted in a working full-stack service platform that demonstrates role-based workflows, repair-request management, authentication, tracking and payment-related integration. Quantitative product outcomes and usage metrics are not currently available.

**Reflection:** Building Sarabo as a solo project provided practical experience managing a full-stack application from client-side flows through server-side functionality. Validation emerged as an important area for further refinement and documentation.`,
        },
      ],
    },
    relatedSlugs: ["ict-crack", "bangladesh-landscape"],
    seo: {
      title: "Sarabo — Case study — Jahid Hasan",
      description:
        "How Sarabo, a multi-role electronics-repair service platform, handles authentication, repair-request tracking, technician assignment, and payments across customer, technician, and administrator roles.",
    },
    missingContent: [
      "public documentation URL",
      "current status detail",
      "validation challenge solution",
      "optional demo video",
    ],
  },
  {
    // Added on Jahid's instruction (2026-10-18) as the most recent public
    // project. No README exists, so every claim below is verified against
    // the live deployment's own description and the two public
    // repositories' source trees and package.json files. Role, timeline,
    // challenges, and outcomes are not yet confirmed by Jahid.
    slug: "ict-crack",
    title: "ICT Crack",
    summary:
      "A Bangla-first learning platform for HSC ICT students with chapter-based interactive lessons and labs, MCQ and creative-question exams, and AI-assisted answer evaluation.",
    projectType: "Full-stack web application",
    status: "live",
    featured: true,
    stack: [
      "React",
      "TanStack Query",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "MongoDB",
      "Zod",
    ],
    capabilities: [
      "Chapter-based lessons following the NCTB HSC ICT textbook",
      "In-browser interactive labs, including logic gates, number systems, a SQL playground, and a C code tracer",
      "Separate MCQ and creative-question exams with model tests",
      "AI-assisted grading of creative answers (Gemini or Anthropic, configurable)",
      "Subscription plans with a free trial period",
      "Study plans, badges, and daily activity tracking",
      "Installable progressive web app",
    ],
    links: [
      {
        label: "Live site",
        url: "https://hsc-ict-creck-client.vercel.app",
        type: "live",
      },
      {
        label: "Client repository",
        url: "https://github.com/jahidjubaer/hsc-ict-creck-client",
        type: "repository",
      },
      {
        label: "Server repository",
        url: "https://github.com/jahidjubaer/hsc-ict-creck-server",
        type: "repository",
      },
    ],
    caseStudyStatus: "in-preparation",
    caseStudy: null,
    relatedSlugs: ["sarabo", "bangladesh-landscape"],
    seo: {
      title: "ICT Crack — Jahid Hasan",
      description:
        "ICT Crack is a Bangla-first HSC ICT learning platform with interactive lessons and labs, MCQ and creative-question exams, and AI-assisted answer evaluation, built with React, Express, and MongoDB.",
    },
    missingContent: [
      "exact role and team context",
      "timeline",
      "challenges",
      "outcomes",
      "screenshots",
    ],
  },
  {
    // Replaced Note Bank as the third featured project on Jahid's
    // instruction (2026-09-29). Summary, stack, and capabilities were
    // verified against the repositories' READMEs and package.json files
    // while they were public. Both repositories are now private (Jahid,
    // 2026-10-18) and no live deployment is confirmed, so nothing is
    // linked.
    slug: "bangladesh-landscape",
    title: "Bangladesh Landscape",
    summary:
      "A district-by-district travel portal for Bangladesh with AI-assisted tour plans, verified local guides, blogs, and stay and transport bookings — Bangla-first with full English support.",
    projectType: "Full-stack web application",
    status: "private",
    featured: true,
    stack: [
      "React",
      "Tailwind CSS",
      "TanStack Query",
      "Node.js",
      "Express",
      "MongoDB",
    ],
    capabilities: [
      "AI-assisted tour planning (Claude/Gemini with a deterministic mock fallback)",
      "Verified guide and partner bookings",
      "Interactive district maps (Leaflet with marker clustering)",
      "Moderated blogs with rich-text editing",
      "JWT cookie authentication and admin operations",
      "Bangla-first bilingual interface",
    ],
    links: [],
    caseStudyStatus: "in-preparation",
    caseStudy: null,
    relatedSlugs: ["sarabo", "ict-crack"],
    seo: {
      title: "Bangladesh Landscape — Jahid Hasan",
      description:
        "Bangladesh Landscape is a Bangla-first travel portal for Bangladesh with AI-assisted tour plans, verified guides, and bookings, built with React, Express, and MongoDB. Full case-study evidence is in preparation.",
    },
    missingContent: [
      "live URL (deployments not yet confirmed reachable)",
      "exact role and team context",
      "timeline",
      "current status detail",
      "challenges",
      "outcomes",
      "visual assets",
    ],
  },
];

export const projects = assertValidProjects(rawProjects);
