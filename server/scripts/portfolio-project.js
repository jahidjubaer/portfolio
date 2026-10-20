/** The hidden `portfolio` project that add-portfolio-project.js imports. */

// Drafted from the repository itself (package.json files, server routes,
// docs/08–11); nothing here is a measured result.
export const PORTFOLIO_PROJECT = {
  slug: "portfolio",
  title: "Portfolio and admin panel",
  summary:
    "This site and the admin panel I edit it with: a React single-page app and an Express API, content in MongoDB, a daily GitHub and coding-stats sync, and a Publish button that rebuilds a prerendered static site.",
  projectType: "Full-stack web app",
  status: "live",
  featured: false,
  hidden: true,
  stack: [
    "React",
    "Vite",
    "React Router",
    "Tailwind CSS",
    "Motion",
    "Node.js",
    "Express",
    "MongoDB",
    "Zod",
    "Vercel Blob",
    "AI SDK",
    "Vitest",
    "Playwright",
  ],
  capabilities: [
    "Admin panel behind GitHub sign-in, limited to one account",
    "Editors validated with the same Zod schemas as the API",
    "Image and PDF uploads to Vercel Blob",
    "Daily sync of GitHub repos and Codeforces / VJudge stats",
    "Publish button that rebuilds a fully prerendered static site",
    "AI drafts of project fields from GitHub repos, reviewed before saving",
  ],
  links: [
    {
      label: "Live site",
      url: "https://jahid-jubaer.vercel.app",
      type: "live",
    },
    {
      label: "Repository",
      url: "https://github.com/jahidjubaer/portfolio",
      type: "repository",
    },
  ],
  caseStudyStatus: "none",
  caseStudy: null,
  relatedSlugs: [],
  seo: {
    title: "Portfolio and admin panel — Jahid Hasan",
    description:
      "A React and Express portfolio with an admin panel, MongoDB content, GitHub and coding-stats sync, and one-click publishing to a prerendered static site.",
  },
  missingContent: [
    "Read every field and correct it in your own words before unhiding.",
    "Your role (e.g. solo project) and the timeline.",
    "Why you built it and what you learned, for a case study.",
    "Screenshots of the site and the admin.",
  ],
};
