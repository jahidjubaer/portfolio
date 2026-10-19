import { z } from "zod";

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

export const socialProfileSchema = z.object({
  id: z.enum(["github", "linkedin", "codeforces", "leetcode"]),
  label: text,
  handle: text,
  url,
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
  education: z.object({
    degree: text,
    university: text,
    graduation: text,
  }),
  problemSolving: z.object({
    total: text,
    primaryLanguage: text,
    platforms: text,
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
    type: z.enum(["text", "gallery"]),
    body: z.string().trim().optional(),
  })
  .refine((section) => section.type !== "text" || Boolean(section.body), {
    message: "Write the section text, or change its type to gallery.",
    path: ["body"],
  });

export const caseStudySchema = z.object({
  role: text.optional(),
  timeline: text.optional(),
  sections: z
    .array(caseStudySectionSchema)
    .min(1, "Add at least one section.")
    .refine(
      (sections) =>
        new Set(sections.map((section) => section.id)).size === sections.length,
      "Each section needs a different ID.",
    ),
  gallery: z.array(z.object({ file: text, caption: text })).optional(),
});

export const projectSchema = z
  .object({
    slug,
    order,
    title: text,
    summary: text,
    projectType: text,
    status: z.enum(PROJECT_STATUS_VALUES),
    featured: z.boolean(),
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

export const experienceSchema = z.object({
  id: slug,
  order,
  date: text,
  sortYear: z.number({ error: "Enter a year." }).int(),
  category: z.enum(["education", "leadership", "community", "work"]),
  title: text,
  organization: text,
  description: text,
  // Longer write-up (from leadership.js) shown on /beyond; optional.
  details: text.optional(),
});

export const skillGroupSchema = z.object({
  id: slug,
  order,
  title: text,
  description: text,
  accent: z.enum(["primary", "secondary", "muted"]),
  items: z.array(text).min(1),
});

/**
 * Certificates and training, grouped by kind so the profile can show
 * professional and leadership credentials separately. Completed entries
 * need an issue date; in-progress ones don't have one yet.
 */
export const certificationSchema = z
  .object({
    id: slug,
    order,
    title: text,
    issuer: text,
    category: z.enum(["professional", "leadership", "other"]),
    status: z.enum(["completed", "in-progress"]),
    issued: text.optional(),
    credentialUrl: url.optional(),
    description: text.optional(),
  })
  .refine((item) => item.status !== "completed" || Boolean(item.issued), {
    message: "A completed certification needs an issue date.",
  });

export const beyondSchema = z.object({
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

/** Everything the public site renders, as one snapshot. */
export const contentSchema = z.object({
  profile: profileSchema,
  projects: z.array(projectSchema),
  experience: z.array(experienceSchema),
  skills: z.array(skillGroupSchema),
  certifications: z.array(certificationSchema),
  beyond: beyondSchema,
  photos: z.array(photoSchema),
  // Published posts only; drafts never reach the public snapshot.
  posts: z.array(postSchema),
});
