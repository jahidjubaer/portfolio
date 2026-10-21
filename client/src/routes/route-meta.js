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
  "/credentials": {
    title: "Education & Certifications — Jahid Hasan",
    description:
      "Jahid Hasan's education (BSc in Computer Science and Engineering, Metropolitan University) and his licenses, certifications, and courses.",
  },
  "/learning": {
    title: "Learning — Jahid Hasan",
    description:
      "How Jahid Hasan learns — learn, practise, build, write — and what he is learning now, linked to the courses, projects, and notes behind it.",
  },
  "/writing": {
    title: "Writing — Jahid Hasan",
    description:
      "Jahid Hasan's learning notes and technical writing, mostly in Bangla: JavaScript from the basics, and tools he uses along the way.",
  },
  "/beyond": {
    title: "Beyond the Code — Jahid Hasan",
    description: "Photography and the books Jahid Hasan is reading.",
  },
  "/contact": {
    title: "Contact — Jahid Hasan",
    description:
      "Get in touch with Jahid Hasan about frontend developer, junior software engineer, MTO, or technical management roles, projects, or questions.",
  },
};

/**
 * The home page's head, with the description from Site settings when one
 * is set there.
 * @param {{ homeDescription?: string } | undefined} seo
 */
export function homeMeta(seo) {
  return seo?.homeDescription
    ? { ...PAGE_META["/"], description: seo.homeDescription }
    : PAGE_META["/"];
}

/**
 * The link-preview image: the one uploaded in Site settings, or the
 * built-in default (1200 × 630).
 * @param {{ shareImage?: { url: string, width: number, height: number } } | undefined} seo
 * @returns {{ url: string, width: number, height: number }}
 */
export function shareImage(seo) {
  return (
    seo?.shareImage ?? { url: SITE.defaultOgImage, width: 1200, height: 630 }
  );
}

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
 * @param {{ title: string, excerpt: string, cover?: { url: string, width: number, height: number } }} post
 */
export function postMeta(post) {
  return {
    title: `${post.title} — Jahid Hasan`,
    description: post.excerpt,
    type: "article",
    ...(post.cover ? { image: post.cover } : {}),
  };
}

/**
 * Every public, indexable route with its head metadata, for the
 * prerender step and the sitemap.
 * @param {{ profile: { resume: { url: string | null } }, projects: Array<{ slug: string, seo: { title: string, description: string } }> }} content
 * @returns {Array<{ path: string, title: string, description: string, type?: string }>}
 */
export function getPublicRoutes(content) {
  const seo = content.settings?.seo;
  return [
    ...Object.entries(PAGE_META).map(([path, meta]) => ({
      path,
      ...(path === "/" ? homeMeta(seo) : meta),
    })),
    { path: "/resume", ...resumeMeta(Boolean(content.profile.resume.url)) },
    ...content.projects.map((project) => ({
      path: `/work/${project.slug}`,
      ...projectMeta(project),
    })),
    ...(content.posts ?? []).map((post) => ({
      path: `/writing/${post.slug}`,
      ...postMeta(post),
    })),
  ];
}
