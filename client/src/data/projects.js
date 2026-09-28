import { assertValidProjects } from "./project-schema";

/**
 * Verified project entries — see CONTENT_CHECKLIST.md section 7. Every
 * field must trace back to a confirmed checklist fact. Unverified facts
 * (exact role, timeline, repositories not yet public, challenges,
 * outcomes, screenshots) are omitted rather than invented; see each
 * project's `missingContent` list for what is still outstanding.
 *
 * @typedef {{ label: string, url: string | null, type: "live" | "repository" | "documentation" }} ProjectLink
 * @typedef {{ name: string, description: string }} ProjectRole
 * @typedef {{ label: string, description: string }} WorkflowStep
 * @typedef {{ name: string, description: string }} ArchitectureLayer
 * @typedef {{ id: string, heading: string }} CaseStudySectionMeta
 * @typedef {{
 *   overview: string,
 *   role?: string,
 *   timeline?: string,
 *   responsibility?: string,
 *   roles?: ProjectRole[],
 *   workflow?: string | WorkflowStep[],
 *   capabilities?: string[],
 *   architecture?: ArchitectureLayer[],
 *   decisions?: string[],
 *   challenge?: string | null,
 *   outcome?: string | null,
 *   reflection?: string | null,
 *   gallery?: { file: string, caption: string }[],
 *   sections: CaseStudySectionMeta[],
 * }} CaseStudy
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   projectType: string,
 *   status: "live" | "repository-available" | "archived",
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
        // Public repository verified 2026-09-29 (source: Jahid's résumé +
        // GitHub API). The server repository is not public, so it is not
        // linked.
        label: "Client repository",
        url: "https://github.com/jahidjubaer/sarabo-client",
        type: "repository",
      },
    ],
    caseStudyStatus: "complete",
    caseStudy: {
      overview:
        "Sarabo is a multi-role electronics-repair service platform. Customers submit repair requests and track progress; technicians manage assigned repairs; administrators oversee accounts, requests, and technician assignment across the platform.",
      role: "Sole Developer",
      timeline: "July–August",
      responsibility:
        "This was a solo project. Jahid was responsible for the end-to-end development of the client and server applications.",
      roles: [
        {
          name: "Customer",
          description:
            "Submits repair requests, tracks progress, reviews quotations, pays through Stripe, and leaves reviews.",
        },
        {
          name: "Technician",
          description:
            "Receives assigned repair requests and updates their progress through the repair lifecycle.",
        },
        {
          name: "Administrator",
          description:
            "Manages accounts and repair requests, and assigns technicians across the platform.",
        },
      ],
      workflow:
        "Sarabo supports a repair-request lifecycle covering service selection, request submission, quotation and review, assignment-related handling, progress tracking and payment-related states.",
      capabilities: SARABO_CAPABILITIES,
      architecture: [
        {
          name: "React client",
          description:
            "The customer, technician, and administrator interfaces.",
        },
        {
          name: "Firebase authentication",
          description:
            "Handles sign-in and role-based access across the client.",
        },
        {
          name: "Express API",
          description:
            "A Node.js and Express API deployed separately from the client, handling repair-request, quotation, and role logic.",
        },
        {
          name: "MongoDB",
          description:
            "Persists repair requests, quotations, roles, and reviews.",
        },
        {
          name: "Stripe",
          description: "Processes customer payments for completed quotations.",
        },
      ],
      decisions: [
        "The React client and the Express API are deployed separately — the client via Firebase Hosting, the API on its own deployment.",
        "Firebase handles authentication while a custom Express and MongoDB API manages repair-request, quotation, and role data.",
      ],
      challenge:
        "Validation was one of the main implementation challenges during development. Detailed notes about the specific validation cases and the final solution are still being documented.",
      outcome:
        "The project resulted in a working full-stack service platform that demonstrates role-based workflows, repair-request management, authentication, tracking and payment-related integration. Quantitative product outcomes and usage metrics are not currently available.",
      reflection:
        "Building Sarabo as a solo project provided practical experience managing a full-stack application from client-side flows through server-side functionality. Validation emerged as an important area for further refinement and documentation.",
      gallery: SARABO_GALLERY,
      sections: [
        { id: "overview", heading: "Overview" },
        { id: "roles", heading: "Roles" },
        { id: "workflow", heading: "Workflow" },
        { id: "capabilities", heading: "Capabilities" },
        { id: "gallery", heading: "Gallery" },
        { id: "architecture", heading: "Architecture" },
        { id: "decisions", heading: "Implementation approach" },
        { id: "reflection", heading: "Challenge, outcome and reflection" },
      ],
    },
    relatedSlugs: ["bang-learner", "bangladesh-landscape"],
    seo: {
      title: "Sarabo — Case study — Jahid Hasan",
      description:
        "How Sarabo, a multi-role electronics-repair service platform, handles authentication, repair-request tracking, technician assignment, and payments across customer, technician, and administrator roles.",
    },
    missingContent: [
      "server repository URL (repository exists but is not public)",
      "public documentation URL",
      "current status detail",
      "validation challenge solution",
      "optional demo video",
    ],
  },
  {
    slug: "bang-learner",
    title: "Bang Learner",
    // Summary, stack, and capabilities verified 2026-09-29 against the
    // public repository (README + package.json) and the live deployment.
    // The previously listed MongoDB was not present in the repository's
    // dependencies — persistence and auth run on Firebase.
    summary:
      "A responsive React platform for offering, learning, and trading skills locally, with Firebase authentication and session booking.",
    projectType: "Web application",
    status: "live",
    featured: true,
    stack: ["React", "React Router", "Tailwind CSS", "DaisyUI", "Firebase"],
    capabilities: [
      "Responsive UI",
      "Firebase authentication (email/password and Google)",
      "Password reset and protected routes",
      "Skill browsing and session booking",
      "Profile management",
    ],
    links: [
      {
        label: "Live site",
        url: "https://bang-learner.web.app",
        type: "live",
      },
      {
        label: "Repository",
        url: "https://github.com/jahidjubaer/bang-learner",
        type: "repository",
      },
    ],
    caseStudyStatus: "in-preparation",
    caseStudy: null,
    relatedSlugs: ["sarabo"],
    seo: {
      title: "Bang Learner — Jahid Hasan",
      description:
        "Bang Learner is a responsive skill-exchange platform built with React, Tailwind CSS, and Firebase. Full case-study evidence is still in preparation.",
    },
    missingContent: [
      "exact role",
      "timeline",
      "technical decisions",
      "challenges",
      "outcomes",
      "visual assets",
    ],
  },
  {
    // Replaced Note Bank as the third featured project on Jahid's
    // instruction (2026-09-29). Summary, stack, and capabilities are
    // verified against the two public repositories' READMEs and
    // package.json files; no live deployment is confirmed yet, so none
    // is linked.
    slug: "bangladesh-landscape",
    title: "Bangladesh Landscape",
    summary:
      "A district-by-district travel portal for Bangladesh with AI-assisted tour plans, verified local guides, blogs, and stay and transport bookings — Bangla-first with full English support.",
    projectType: "Full-stack web application",
    status: "repository-available",
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
    links: [
      {
        label: "Client repository",
        url: "https://github.com/jahidjubaer/bangladesh-landscape-client",
        type: "repository",
      },
      {
        label: "Server repository",
        url: "https://github.com/jahidjubaer/bangladesh-landscape-server",
        type: "repository",
      },
    ],
    caseStudyStatus: "in-preparation",
    caseStudy: null,
    relatedSlugs: ["sarabo"],
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
