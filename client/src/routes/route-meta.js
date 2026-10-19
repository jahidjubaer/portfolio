/**
 * Titles and descriptions for every public route, shared by the pages
 * (usePageMeta, in the browser) and scripts/prerender.js (static HTML for
 * crawlers and link previews), so the two can never disagree. Plain data
 * only: this module also runs in Node at build time.
 */

export const SITE = {
  name: "Jahid Hasan",
  locale: "en_US",
  twitterCard: "summary_large_image",
  // A raster image — most social platforms will not render an SVG preview.
  defaultOgImage: "/assets/og/og-default.png",
};

export const PAGE_META = {
  "/": {
    title: "Jahid Hasan — Frontend Developer & Junior Software Engineer",
    description:
      "Portfolio of Jahid Hasan, a CSE graduate and React-focused frontend developer building modern web products and expanding into full-stack and AI-enabled engineering.",
  },
  "/work": {
    title: "Projects — Jahid Hasan",
    description:
      "Projects by Jahid Hasan: multi-role web platforms, React interfaces, and full-stack products built with React, Express, and MongoDB.",
  },
  "/learning": {
    title: "Learning — Jahid Hasan",
    description:
      "An index of Jahid Hasan's learning notes and technical writing — engineering notes, project lessons, and problem-solving reflections, published on Blogger.",
  },
  "/beyond": {
    title: "Beyond the Code — Jahid Hasan",
    description:
      "Photography, sports, leadership, and volunteering by Jahid Hasan.",
  },
  "/contact": {
    title: "Contact — Jahid Hasan",
    description:
      "Get in touch with Jahid Hasan about frontend developer, junior software engineer, MTO, or technical management roles, projects, or questions.",
  },
};

/** @param {boolean} resumeAvailable */
export function resumeMeta(resumeAvailable) {
  return {
    title: "Resume — Jahid Hasan",
    description: resumeAvailable
      ? "Resume summary and downloadable PDF for Jahid Hasan, a CSE graduate and frontend developer / junior software engineer."
      : "Resume summary of Jahid Hasan, a CSE graduate and frontend developer / junior software engineer.",
  };
}

/** @param {{ seo: { title: string, description: string } }} project */
export function projectMeta(project) {
  return {
    title: project.seo.title,
    description: project.seo.description,
    type: "article",
  };
}

/**
 * Every public, indexable route with its head metadata, for the
 * prerender step and the sitemap.
 * @param {{ profile: { resume: { url: string | null } }, projects: Array<{ slug: string, seo: { title: string, description: string } }> }} content
 * @returns {Array<{ path: string, title: string, description: string, type?: string }>}
 */
export function getPublicRoutes(content) {
  return [
    ...Object.entries(PAGE_META).map(([path, meta]) => ({ path, ...meta })),
    { path: "/resume", ...resumeMeta(Boolean(content.profile.resume.url)) },
    ...content.projects.map((project) => ({
      path: `/work/${project.slug}`,
      ...projectMeta(project),
    })),
  ];
}
