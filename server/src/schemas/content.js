import { z } from "zod";
import {
  ACCENT_IDS,
  FONT_IDS,
  INTRO_STYLES,
  NAV_ITEMS,
  PROFILE_SECTIONS,
  THEME_IDS,
} from "./settings-defaults.js";

/**
 * Zod schemas for every editable content collection. The seed script, the
 * admin API, and the admin forms (client/src/features/admin) all validate
 * with these, so the database only ever holds the shapes the public site
 * renders. Shapes mirror client/src/data/* — keep the two in step.
 * Messages are written for the admin form, next to the field.
 */

const text = z.string({ error: "Required." }).trim().min(1, "Required.");
const url = z.url({
  error: "Enter a full web address, starting with https://",
});
const order = z.number().int().min(0);
const slug = z
  .string({ error: "Required." })
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and dashes (e.g. my-project).",
  );

export const SOCIAL_NETWORKS = [
  "github",
  "linkedin",
  "codeforces",
  "vjudge",
  "leetcode",
  "facebook",
  "instagram",
];

export const socialProfileSchema = z.object({
  id: z.enum(SOCIAL_NETWORKS),
  label: text,
  handle: text,
  url,
  // Kept in the admin but left off the public site (e.g. an unused
  // LeetCode account).
  hidden: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: text,
  monogram: text,
  title: text,
  supportingDirection: text,
  location: text,
  targetRoles: z.array(text).min(1),
  availabilityStatement: text,
  availabilityDetail: text,
  about: z.array(text).min(1),
  heroHeadline: text,
  heroSupport: text,
  email: z.email({ error: "Enter a valid email address." }),
  github: url,
  linkedin: url,
  codeforces: url,
  leetcode: url,
  problemSolving: z.object({
    // Only shown before the first sync; afterwards the headline is the
    // synced distinct total (docs/11 D2).
    total: text,
    primaryLanguage: text,
    platforms: text,
    // Live stats (synced daily, see services/codingStatsService.js).
    codeforcesHandle: text.optional(),
    vjudgeHandle: text.optional(),
    // A repo of the synced GitHub account that holds the solutions.
    practiceRepo: text.optional(),
    // "paused" shows the stats as a past-practice archive.
    status: z.enum(["active", "paused"]).optional(),
    // Dimik OJ has no public API, so its count is typed in the admin.
    dimikSolved: z
      .number({ error: "Enter a number." })
      .int()
      .min(0, "Can't be negative.")
      .optional(),
    // How many problems Dimik OJ has, so the count reads "40 / 52".
    dimikTotal: z
      .number({ error: "Enter a number." })
      .int()
      .min(1, "Must be at least 1.")
      .optional(),
  }),
  resume: z.object({
    filename: text,
    // A site path ("/assets/…") or an uploaded Vercel Blob URL.
    url: text.nullable(),
    updatedLabel: text,
  }),
  socialProfiles: z.array(socialProfileSchema),
});

export const PROJECT_STATUS_VALUES = [
  "live",
  "repository-available",
  "private",
  "archived",
];
export const CASE_STUDY_STATUS_VALUES = ["complete", "in-preparation", "none"];

const projectLinkSchema = z.object({
  label: text,
  url: url.nullable(),
  type: z.enum(["live", "repository", "documentation"]),
});

/**
 * A case study is an ordered list of sections. Text sections hold a
 * Markdown body; a gallery section marks where the project's screenshots
 * appear (captions come from `gallery`, keyed by screenshot file name).
 * Section ids double as in-page anchors for the section navigation.
 */
export const caseStudySectionSchema = z
  .object({
    id: slug,
    heading: text,
    // "diagram" shows caseStudy.architecture, with optional text above it.
    type: z.enum(["text", "gallery", "diagram"]),
    body: z.string().trim().optional(),
  })
  .refine((section) => section.type !== "text" || Boolean(section.body), {
    message: "Write the section text, or change its type to gallery.",
    path: ["body"],
  });

const gridPosition = z
  .number({ error: "Enter 1, 2, or 3." })
  .int("Enter 1, 2, or 3.")
  .min(1, "Enter 1, 2, or 3.")
  .max(3, "Enter 1, 2, or 3.");

/**
 * The architecture diagram: parts on a 3 × 3 grid, and the steps of the
 * flow between them in order. The case study draws one step at a time as
 * the reader scrolls, so every step must be a real, confirmed connection.
 */
export const architectureSchema = z
  .object({
    nodes: z
      .array(
        z.object({
          id: slug,
          label: text,
          column: gridPosition,
          row: gridPosition,
        }),
      )
      .min(2, "Add at least two parts."),
    steps: z
      .array(z.object({ from: slug, to: slug, label: text }))
      .min(1, "Add at least one step."),
  })
  .superRefine((architecture, context) => {
    const ids = new Set();
    const cells = new Set();
    architecture.nodes.forEach((node, index) => {
      if (ids.has(node.id)) {
        context.addIssue({
          code: "custom",
          message: "Each part needs a different ID.",
          path: ["nodes", index, "id"],
        });
      }
      ids.add(node.id);
      const cell = `${node.column}:${node.row}`;
      if (cells.has(cell)) {
        context.addIssue({
          code: "custom",
          message: "Another part already uses this column and row.",
          path: ["nodes", index, "row"],
        });
      }
      cells.add(cell);
    });
    architecture.steps.forEach((step, index) => {
      for (const end of ["from", "to"]) {
        if (!ids.has(step[end])) {
          context.addIssue({
            code: "custom",
            message: "Use the ID of one of the parts above.",
            path: ["steps", index, end],
          });
        }
      }
      if (step.from === step.to) {
        context.addIssue({
          code: "custom",
          message: "A step connects two different parts.",
          path: ["steps", index, "to"],
        });
      }
    });
  });

export const caseStudySchema = z
  .object({
    role: text.optional(),
    timeline: text.optional(),
    sections: z
      .array(caseStudySectionSchema)
      .min(1, "Add at least one section.")
      .refine(
        (sections) =>
          new Set(sections.map((section) => section.id)).size ===
          sections.length,
        "Each section needs a different ID.",
      ),
    gallery: z.array(z.object({ file: text, caption: text })).optional(),
    architecture: architectureSchema.optional(),
  })
  .refine(
    (caseStudy) =>
      Boolean(caseStudy.architecture) ||
      !caseStudy.sections.some((section) => section.type === "diagram"),
    {
      message:
        "A diagram section needs the architecture diagram's parts and steps.",
      path: ["architecture"],
    },
  );

export const projectSchema = z
  .object({
    slug,
    order,
    title: text,
    summary: text,
    projectType: text,
    status: z.enum(PROJECT_STATUS_VALUES),
    featured: z.boolean(),
    // "Hidden until ready": kept in the admin, left out of the public
    // snapshot (so out of the routes and the sitemap too).
    hidden: z.boolean().optional(),
    stack: z.array(text),
    capabilities: z.array(text),
    links: z.array(projectLinkSchema),
    caseStudyStatus: z.enum(CASE_STUDY_STATUS_VALUES),
    caseStudy: caseStudySchema.nullable(),
    roleContext: text.optional(),
    relatedSlugs: z.array(text),
    seo: z.object({ title: text, description: text }),
    missingContent: z.array(text),
  })
  .refine(
    (project) =>
      project.caseStudyStatus !== "complete" || project.caseStudy !== null,
    {
      message: "A complete case study needs at least one section.",
      path: ["caseStudy"],
    },
  );

/**
 * An uploaded image in the Vercel Blob store. Width and height are read
 * from the file before upload, so pages can reserve space (no layout shift).
 */
export const blobImageSchema = z.object(
  {
    url: url.refine(
      (value) =>
        URL.canParse(value) &&
        new URL(value).hostname.endsWith(".blob.vercel-storage.com"),
      "Upload the image instead of linking to it.",
    ),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  },
  { error: "Upload an image." },
);

/**
 * "2024" or "2024-06". Months are optional because most early dates are
 * only known to the year; durations are computed from these, never typed.
 */
export const yearMonth = z
  .string({ error: "Required." })
  .regex(
    /^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/,
    "Use a year or year-month, e.g. 2024 or 2024-06.",
  );

/**
 * Companies, clubs, schools, and course providers. Experience, education,
 * certifications, and learning resources point here by id, so a logo and
 * link are entered once.
 */
export const organizationSchema = z.object({
  id: slug,
  order,
  name: text,
  logo: blobImageSchema.optional(),
  url: url.optional(),
  location: text.optional(),
});

export const EMPLOYMENT_TYPE_VALUES = [
  "full-time",
  "part-time",
  "internship",
  "contract",
  "freelance",
  "self-employed",
  "volunteer",
];
export const WORKPLACE_VALUES = ["on-site", "hybrid", "remote"];

// Compared at the precision both dates have: "2024" vs "2024-06" by year.
function endsAfterStart(item) {
  if (!item.end || !item.start) return true;
  const length = Math.min(item.end.length, item.start.length);
  return item.end.slice(0, length) >= item.start.slice(0, length);
}

export const roleSchema = z
  .object({
    title: text,
    employmentType: z.enum(EMPLOYMENT_TYPE_VALUES).optional(),
    start: yearMonth,
    end: yearMonth.optional(),
    // Explicit, so a forgotten end date never claims a current role.
    current: z.boolean().optional(),
    location: text.optional(),
    workplace: z.enum(WORKPLACE_VALUES).optional(),
    description: text.optional(),
    skills: z.array(text).optional(),
  })
  .refine((role) => Boolean(role.end) !== Boolean(role.current), {
    message: 'Add an end date, or tick "I currently hold this role".',
    path: ["end"],
  })
  .refine(endsAfterStart, {
    message: "The end date is before the start date.",
    path: ["end"],
  });

export const EXPERIENCE_CATEGORY_VALUES = ["work", "leadership", "community"];

/** One organization and every role held there (LinkedIn's grouping). */
export const experienceSchema = z.object({
  id: slug,
  order,
  organizationId: slug,
  category: z.enum(EXPERIENCE_CATEGORY_VALUES),
  roles: z.array(roleSchema).min(1, "Add at least one role."),
});

export const educationSchema = z
  .object({
    id: slug,
    order,
    organizationId: slug,
    degree: text,
    field: text.optional(),
    start: yearMonth.optional(),
    end: yearMonth.optional(),
    grade: text.optional(),
    // CLAUDE.md: a grade/CGPA is only shown once Jahid confirms it.
    showGrade: z.boolean().optional(),
    activities: text.optional(),
    description: text.optional(),
    skills: z.array(text).optional(),
  })
  .refine(endsAfterStart, {
    message: "The end date is before the start date.",
    path: ["end"],
  });

export const skillGroupSchema = z.object({
  id: slug,
  order,
  title: text,
  description: text,
  accent: z.enum(["primary", "secondary", "muted"]),
  items: z.array(text).min(1),
});

export const CERTIFICATION_KIND_VALUES = ["certification", "course"];
export const CERTIFICATION_CATEGORY_VALUES = [
  "professional",
  "leadership-community",
];

/**
 * Licenses, certificates, and courses (LinkedIn's "Licenses &
 * certifications"). Completed entries need an issue date; in-progress ones
 * don't have one yet. Add `credentialUrl` only with a real verification
 * link; `courseUrl` is the course's own page (e.g. on Coursera).
 */
export const certificationSchema = z
  .object({
    id: slug,
    order,
    title: text,
    organizationId: slug,
    kind: z.enum(CERTIFICATION_KIND_VALUES),
    // Optional until Jahid approves the docs/11 category migration
    // (server/scripts/certification-categories.js); the site treats a
    // missing one as professional and the admin flags it.
    category: z.enum(CERTIFICATION_CATEGORY_VALUES).optional(),
    status: z.enum(["completed", "in-progress"]),
    issued: yearMonth.optional(),
    expires: yearMonth.optional(),
    credentialId: text.optional(),
    credentialUrl: url.optional(),
    courseUrl: url.optional(),
    description: text.optional(),
    skills: z.array(text).optional(),
    image: blobImageSchema.optional(),
    imageAlt: text.optional(),
    // Shown in the profile's short preview; the full list is on /credentials.
    featured: z.boolean().optional(),
  })
  .refine((item) => item.status !== "completed" || Boolean(item.issued), {
    message: "A completed certification needs an issue date.",
    path: ["issued"],
  })
  .refine((item) => !item.image || item.imageAlt, {
    message: "Describe the certificate image.",
    path: ["imageAlt"],
  });

/** The "How I learn" steps at the top of /learning. */
export const learningSchema = z.object({
  intro: text.optional(),
  steps: z
    .array(z.object({ title: text, description: text }))
    .min(1, "Add at least one step."),
});

export const LEARNING_STATUS_VALUES = ["learning", "applied", "exploring"];

/**
 * One topic and the path through it: what it was learned from, how it
 * was practised, what was built with it, and the notes written about it.
 * Projects and certifications are referenced by id, never retyped.
 */
export const learningTrackSchema = z.object({
  id: slug,
  order,
  title: text,
  status: z.enum(LEARNING_STATUS_VALUES),
  since: yearMonth.optional(),
  summary: text.optional(),
  resources: z.array(
    z.object({
      label: text,
      url: url.optional(),
      organizationId: slug.optional(),
    }),
  ),
  certificationIds: z.array(slug),
  practice: text.optional(),
  projectSlugs: z.array(slug),
  notes: z.array(z.object({ label: text, url })),
  // Names of repos of the synced GitHub account, shown with their stats.
  repos: z.array(text).optional(),
});

export const beyondSchema = z.object({
  // Optional: added after the first Beyond content (docs/09, P4).
  languages: z.array(z.object({ name: text, level: text })).optional(),
  interests: z.array(text).optional(),
  sports: z.array(
    z.object({ title: text, description: text, tags: z.array(text) }),
  ),
  volunteering: z.array(
    z.object({
      organization: text,
      period: text,
      description: text,
      tags: z.array(text),
    }),
  ),
});

export const photoSchema = z.object({
  id: slug,
  order,
  image: blobImageSchema,
  alt: text.max(250, "Keep the description under 250 characters."),
  caption: text.optional(),
  album: text,
});

const isoDate = z.iso.date({ error: "Use the format YYYY-MM-DD." });

export const POST_STATUS_VALUES = ["draft", "published"];

/** Blog posts. Drafts are stored but never leave the admin. */
export const postSchema = z
  .object({
    slug,
    order,
    title: text,
    excerpt: text.max(300, "Keep the summary under 300 characters."),
    body: text,
    tags: z.array(text),
    status: z.enum(POST_STATUS_VALUES),
    publishedAt: isoDate.optional(),
    cover: blobImageSchema.optional(),
    coverAlt: text.optional(),
  })
  .refine((post) => post.status !== "published" || post.publishedAt, {
    message: "A published post needs a publish date.",
    path: ["publishedAt"],
  })
  .refine((post) => !post.cover || post.coverAlt, {
    message: "Describe the cover image.",
    path: ["coverAlt"],
  });

const showcaseSchema = z.object({
  limit: z
    .number({ error: "Enter a number." })
    .int()
    .min(1, "Show at least one.")
    .max(24, "Show at most 24."),
  siteUrl: url.optional(),
  siteLabel: text.max(60).optional(),
  siteDescription: text.max(200).optional(),
});

/**
 * Site-wide settings (docs/09, P4): visitor defaults for appearance, the
 * opening animation, which profile sections and pages show, the
 * availability badge, and SEO. Ids and defaults live in
 * settings-defaults.js, which the public site imports without Zod.
 */
export const settingsSchema = z.object({
  appearance: z.object({
    theme: z.enum(THEME_IDS),
    accent: z.enum(ACCENT_IDS),
    font: z.enum(FONT_IDS),
  }),
  intro: z.object({
    enabled: z.boolean(),
    sound: z.boolean(),
    style: z.enum(INTRO_STYLES),
  }),
  profileSections: z
    .array(
      z.object({
        id: z.enum(PROFILE_SECTIONS.map(({ id }) => id)),
        visible: z.boolean(),
      }),
    )
    .refine(
      (sections) =>
        sections.length === PROFILE_SECTIONS.length &&
        new Set(sections.map((section) => section.id)).size ===
          PROFILE_SECTIONS.length,
      "Every profile section must be listed once.",
    ),
  showGithubActivity: z.boolean(),
  navigation: z.object(
    Object.fromEntries(
      NAV_ITEMS.map(({ id }) => [
        id,
        z.object({
          label: text.max(24, "Keep menu labels short (24 characters)."),
          visible: z.boolean(),
        }),
      ]),
    ),
  ),
  openToWorkBadge: z.boolean(),
  // Writing and Beyond show a few samples and link to the full site.
  showcase: z.object({
    photos: showcaseSchema,
    posts: showcaseSchema,
  }),
  // After the daily GitHub/coding sync, rebuild the site when the
  // synced numbers changed.
  autoPublishAfterSync: z.boolean(),
  seo: z.object({
    homeDescription: text
      .max(300, "Search engines show about 160 characters; keep it under 300.")
      .optional(),
    shareImage: blobImageSchema.optional(),
  }),
});

// [list, field, target list, target key]: every id must resolve.
const REFERENCE_CHECKS = [
  ["experience", "organizationId", "organizations", "id"],
  ["education", "organizationId", "organizations", "id"],
  ["certifications", "organizationId", "organizations", "id"],
  ["learningTracks", "certificationIds", "certifications", "id"],
  ["learningTracks", "projectSlugs", "projects", "slug"],
];

/**
 * Ids that point at a missing item, as Zod-style issues. Used by the
 * snapshot schema, and by the admin API before it saves or deletes.
 * @param {Record<string, any>} content
 * @returns {Array<{ path: Array<string | number>, message: string }>}
 */
export function findBrokenReferences(content) {
  const issues = [];
  const has = (target, key, value) =>
    (content[target] ?? []).some((item) => item[key] === value);
  for (const [list, field, target, key] of REFERENCE_CHECKS) {
    (content[list] ?? []).forEach((item, index) => {
      for (const value of [item[field]].flat().filter(Boolean)) {
        if (!has(target, key, value)) {
          issues.push({
            path: [list, index, field],
            message: `"${value}" isn't in ${target}.`,
          });
        }
      }
    });
  }
  (content.learningTracks ?? []).forEach((track, index) => {
    (track.resources ?? []).forEach((resource, resourceIndex) => {
      const id = resource.organizationId;
      if (id && !has("organizations", "id", id)) {
        issues.push({
          path: ["learningTracks", index, "resources", resourceIndex],
          message: `"${id}" isn't in organizations.`,
        });
      }
    });
  });
  return issues;
}

/** Everything the public site renders, as one snapshot. */
export const contentSchema = z
  .object({
    profile: profileSchema,
    projects: z.array(projectSchema),
    organizations: z.array(organizationSchema),
    experience: z.array(experienceSchema),
    education: z.array(educationSchema),
    skills: z.array(skillGroupSchema),
    certifications: z.array(certificationSchema),
    learning: learningSchema,
    learningTracks: z.array(learningTrackSchema),
    settings: settingsSchema,
    beyond: beyondSchema,
    photos: z.array(photoSchema),
    // Published posts only; drafts never reach the public snapshot.
    posts: z.array(postSchema),
  })
  .superRefine((content, context) => {
    for (const issue of findBrokenReferences(content)) {
      context.addIssue({ code: "custom", ...issue });
    }
  });
