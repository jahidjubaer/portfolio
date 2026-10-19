// The admin validates with the exact schemas the API enforces.
import {
  beyondSchema,
  certificationSchema,
  experienceSchema,
  photoSchema,
  postSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
} from "../../../../server/src/schemas/content.js";

const SOCIAL_OPTIONS = ["github", "linkedin", "codeforces", "leetcode"].map(
  (value) => ({ value, label: value }),
);

/** Single-document sections: one form each. */
export const SINGLETONS = {
  profile: {
    label: "Profile & hero",
    description:
      "Name, headline, about, roles you're open to, and contact links.",
    schema: profileSchema,
    fields: [
      { name: "name", label: "Full name" },
      { name: "monogram", label: "Monogram", hint: 'Short mark, e.g. "JH."' },
      { name: "title", label: "Title", hint: "Shown under your name." },
      { name: "heroHeadline", label: "Headline" },
      {
        name: "heroSupport",
        label: "Intro sentence",
        type: "textarea",
        rows: 3,
      },
      {
        name: "supportingDirection",
        label: "Direction",
        type: "textarea",
        rows: 2,
      },
      { name: "about", label: "About", type: "paragraphs", rows: 7 },
      { name: "targetRoles", label: "Open to (roles)", type: "lines" },
      { name: "availabilityStatement", label: "Availability (one line)" },
      {
        name: "availabilityDetail",
        label: "Availability (detail)",
        type: "textarea",
        rows: 3,
      },
      { name: "location", label: "Location" },
      { name: "email", label: "Email", type: "email" },
      { name: "github", label: "GitHub URL", type: "url" },
      { name: "linkedin", label: "LinkedIn URL", type: "url" },
      { name: "codeforces", label: "Codeforces URL", type: "url" },
      { name: "leetcode", label: "LeetCode URL", type: "url" },
      { name: "education.degree", label: "Degree" },
      { name: "education.university", label: "University" },
      { name: "education.graduation", label: "Graduation" },
      { name: "problemSolving.total", label: "Problem solving (headline)" },
      { name: "problemSolving.primaryLanguage", label: "Main language" },
      { name: "problemSolving.platforms", label: "Platforms" },
      { name: "resume.filename", label: "Resume file name" },
      {
        name: "resume.url",
        label: "Resume PDF",
        type: "pdf",
        nullable: true,
        hint: "Upload a PDF, or keep a site path such as /assets/resume/….pdf.",
      },
      { name: "resume.updatedLabel", label: "Resume updated label" },
      {
        name: "socialProfiles",
        label: "Find me on",
        type: "objectList",
        itemLabel: "profile",
        newItem: { id: "github" },
        fields: [
          {
            name: "id",
            label: "Network",
            type: "select",
            options: SOCIAL_OPTIONS,
          },
          { name: "label", label: "Label" },
          { name: "handle", label: "Handle" },
          { name: "url", label: "URL", type: "url" },
        ],
      },
    ],
  },
  beyond: {
    label: "Beyond",
    description: "Sports and volunteering highlights on the Beyond page.",
    schema: beyondSchema,
    fields: [
      {
        name: "sports",
        label: "Sports",
        type: "objectList",
        itemLabel: "highlight",
        fields: [
          { name: "title", label: "Title" },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            rows: 3,
          },
          { name: "tags", label: "Tags", type: "lines" },
        ],
      },
      {
        name: "volunteering",
        label: "Volunteering",
        type: "objectList",
        itemLabel: "role",
        fields: [
          { name: "organization", label: "Organization" },
          { name: "period", label: "Period" },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            rows: 3,
          },
          { name: "tags", label: "Tags", type: "lines" },
        ],
      },
    ],
  },
};

const KEY_HINT = "Lowercase words joined by dashes. Can't be changed later.";

/** "Challenge & outcome!" → "challenge-outcome" */
export function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The form always edits a case-study object; an empty one is saved as
 * null. Blank anchors come from the heading, and gallery sections drop
 * any leftover text.
 */
export function normalizeProject(project) {
  const caseStudy = project.caseStudy ?? {};
  const sections = (caseStudy.sections ?? []).map((section) => ({
    ...section,
    id: section.id || slugify(section.heading),
    body: section.type === "text" ? section.body : undefined,
  }));
  const isEmpty =
    sections.length === 0 && !caseStudy.role && !caseStudy.timeline;
  return {
    ...project,
    caseStudy: isEmpty
      ? null
      : {
          ...caseStudy,
          sections,
          gallery: caseStudy.gallery?.length ? caseStudy.gallery : undefined,
        },
  };
}

const NEW_PROJECT = {
  status: "repository-available",
  featured: false,
  caseStudyStatus: "none",
  caseStudy: null,
  links: [],
  relatedSlugs: [],
  missingContent: [],
};

/** "hsc-ict-creck-client" → "Hsc Ict Creck Client" */
function titleFromRepoName(name) {
  return name
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * A new project prefilled from a synced GitHub repo ("Add as project").
 * Only facts GitHub knows are filled in; the rest is left for Jahid.
 * @param {{ name: string, url: string, description: string | null, language: string | null, topics: string[], homepage: string | null }} repo
 */
export function projectFromRepo(repo) {
  const title = titleFromRepoName(repo.name);
  const links = [{ label: "Repository", url: repo.url, type: "repository" }];
  if (repo.homepage) {
    links.unshift({ label: "Live site", url: repo.homepage, type: "live" });
  }
  return {
    ...NEW_PROJECT,
    slug: slugify(repo.name),
    title,
    summary: repo.description ?? "",
    status: repo.homepage ? "live" : "repository-available",
    stack: [...new Set([repo.language, ...repo.topics].filter(Boolean))],
    links,
    seo: { title, description: repo.description ?? "" },
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Ordered lists: a list page plus an add/edit form per item. */
export const LISTS = {
  projects: {
    label: "Projects",
    itemLabel: "project",
    description: "Order, featured projects, links, and case studies.",
    keyField: "slug",
    schema: projectSchema,
    normalize: normalizeProject,
    titleOf: (item) => item.title,
    subtitleOf: (item) =>
      [item.featured ? "Featured" : null, item.status]
        .filter(Boolean)
        .join(" · "),
    // Router state from the GitHub repos page's "Add as project".
    newItem: (state) =>
      state?.fromRepo ? projectFromRepo(state.fromRepo) : NEW_PROJECT,
    prefilledNote: (state) =>
      state?.fromRepo
        ? `Prefilled from ${state.fromRepo.name} on GitHub. Check every field and write the summary in your own words before saving.`
        : undefined,
    fields: [
      {
        name: "slug",
        label: "URL slug",
        hint: KEY_HINT,
        readOnlyWhenEditing: true,
      },
      { name: "title", label: "Title" },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      {
        name: "projectType",
        label: "Project type",
        hint: 'e.g. "Full-stack web platform"',
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "live", label: "Live" },
          { value: "repository-available", label: "Repository available" },
          { value: "private", label: "Private repository" },
          { value: "archived", label: "Archived" },
        ],
      },
      { name: "featured", label: "Featured on the profile", type: "checkbox" },
      { name: "stack", label: "Tech stack", type: "lines" },
      { name: "capabilities", label: "Key features", type: "lines" },
      { name: "roleContext", label: "Your role", optional: true },
      {
        name: "links",
        label: "Links",
        type: "objectList",
        itemLabel: "link",
        newItem: { type: "repository" },
        fields: [
          { name: "label", label: "Label" },
          { name: "url", label: "URL", type: "url", nullable: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: [
              { value: "live", label: "Live site" },
              { value: "repository", label: "Repository" },
              { value: "documentation", label: "Documentation" },
            ],
          },
        ],
      },
      {
        name: "caseStudyStatus",
        label: "Case study",
        type: "select",
        options: [
          { value: "complete", label: "Complete" },
          { value: "in-preparation", label: "In preparation" },
          { value: "none", label: "None" },
        ],
      },
      {
        name: "caseStudy.role",
        label: "Case study: your role",
        optional: true,
      },
      {
        name: "caseStudy.timeline",
        label: "Case study: timeline",
        optional: true,
        hint: 'e.g. "July–August"',
      },
      {
        name: "caseStudy.sections",
        label: "Case study sections",
        type: "objectList",
        itemLabel: "section",
        newItem: { type: "text" },
        fields: [
          { name: "heading", label: "Heading" },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: [
              { value: "text", label: "Text (Markdown)" },
              { value: "gallery", label: "Screenshot gallery" },
            ],
          },
          {
            name: "body",
            label: "Text",
            type: "markdown",
            rows: 10,
            optional: true,
            showWhen: (section) => section.type === "text",
          },
          {
            name: "id",
            label: "Link anchor",
            optional: true,
            hint: "For links like /work/sarabo#overview. Leave blank to make one from the heading.",
          },
        ],
      },
      {
        name: "caseStudy.gallery",
        label: "Screenshot captions",
        type: "objectList",
        itemLabel: "caption",
        fields: [
          {
            name: "file",
            label: "Screenshot file",
            hint: 'File name in the project screenshot folder, e.g. "screenshot-01.webp"',
          },
          { name: "caption", label: "Caption" },
        ],
      },
      {
        name: "relatedSlugs",
        label: "Related projects (slugs)",
        type: "lines",
      },
      { name: "seo.title", label: "SEO title" },
      {
        name: "seo.description",
        label: "SEO description",
        type: "textarea",
        rows: 2,
      },
      {
        name: "missingContent",
        label: "Still missing (private notes)",
        type: "lines",
      },
    ],
  },
  experience: {
    label: "Experience",
    itemLabel: "entry",
    description: "Leadership, community, work, and education timeline.",
    keyField: "id",
    schema: experienceSchema,
    titleOf: (item) => item.title,
    subtitleOf: (item) => `${item.organization} · ${item.date}`,
    newItem: { category: "leadership" },
    fields: [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      { name: "title", label: "Role / title" },
      { name: "organization", label: "Organization" },
      {
        name: "date",
        label: "Dates",
        hint: 'Shown as written, e.g. "2024–2025"',
      },
      { name: "sortYear", label: "Start year", type: "number" },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "work", label: "Work" },
          { value: "leadership", label: "Leadership" },
          { value: "community", label: "Community" },
          { value: "education", label: "Education" },
        ],
      },
      {
        name: "description",
        label: "Short description",
        type: "textarea",
        rows: 2,
      },
      {
        name: "details",
        label: "Longer write-up",
        type: "textarea",
        rows: 4,
        optional: true,
      },
    ],
  },
  skills: {
    label: "Skills",
    itemLabel: "skill group",
    description: "Skill groups. No levels or percentages.",
    keyField: "id",
    schema: skillGroupSchema,
    titleOf: (item) => item.title,
    subtitleOf: (item) => `${item.items.length} skills`,
    newItem: { accent: "secondary" },
    fields: [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      { name: "title", label: "Group title" },
      { name: "description", label: "Description" },
      {
        name: "accent",
        label: "Style",
        type: "select",
        options: [
          { value: "primary", label: "Strength (accent)" },
          { value: "secondary", label: "Foundation" },
          { value: "muted", label: "Learning (dashed)" },
        ],
      },
      { name: "items", label: "Skills", type: "lines", rows: 6 },
    ],
  },
  certifications: {
    label: "Certifications",
    itemLabel: "certification",
    description: "Professional, leadership, and other certificates.",
    keyField: "id",
    schema: certificationSchema,
    titleOf: (item) => item.title,
    subtitleOf: (item) =>
      `${item.issuer} · ${item.status === "in-progress" ? "In progress" : item.issued}`,
    newItem: { category: "professional", status: "completed" },
    fields: [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      { name: "title", label: "Title" },
      { name: "issuer", label: "Issued by" },
      {
        name: "category",
        label: "Group",
        type: "select",
        options: [
          { value: "professional", label: "Professional" },
          { value: "leadership", label: "Leadership" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "completed", label: "Completed" },
          { value: "in-progress", label: "In progress" },
        ],
      },
      {
        name: "issued",
        label: "Issued (year or month & year)",
        optional: true,
      },
      {
        name: "credentialUrl",
        label: "Verification link",
        type: "url",
        optional: true,
      },
      {
        name: "description",
        label: "What it covered",
        type: "textarea",
        rows: 2,
        optional: true,
      },
    ],
  },
  photos: {
    label: "Photography",
    itemLabel: "photo",
    description: "Photos for the Beyond page, grouped into albums.",
    keyField: "id",
    schema: photoSchema,
    titleOf: (item) => item.alt,
    subtitleOf: (item) => item.album,
    thumbnailOf: (item) => item.image,
    // Photos have no meaningful name to type, so the id is generated.
    newItem: () => ({
      id: `photo-${Date.now().toString(36)}`,
      image: null,
    }),
    fields: (content) => [
      {
        name: "image",
        label: "Photo",
        type: "image",
        uploadKind: "photo",
        hint: "Resized to 2400 px on the long edge and saved as WebP.",
      },
      {
        name: "alt",
        label: "Description (alt text)",
        type: "textarea",
        rows: 2,
        hint: "What's in the photo, for people who can't see it. Under 250 characters.",
      },
      { name: "caption", label: "Caption", optional: true },
      {
        name: "album",
        label: "Album",
        suggestions: [
          ...new Set((content.photos ?? []).map((photo) => photo.album)),
        ],
        hint: "Photos with the same album name are grouped together.",
      },
    ],
  },
  posts: {
    label: "Writing",
    itemLabel: "post",
    description: "Blog posts in Markdown. Drafts stay private.",
    keyField: "slug",
    schema: postSchema,
    titleOf: (item) => item.title,
    subtitleOf: (item) =>
      item.status === "published" ? `Published ${item.publishedAt}` : "Draft",
    // Posts are listed newest first, so manual ordering doesn't apply.
    sortable: false,
    compare: (a, b) =>
      (b.publishedAt ?? "9999").localeCompare(a.publishedAt ?? "9999"),
    newItem: () => ({ status: "draft", tags: [], publishedAt: today() }),
    fields: [
      {
        name: "slug",
        label: "URL slug",
        hint: KEY_HINT,
        readOnlyWhenEditing: true,
      },
      { name: "title", label: "Title" },
      {
        name: "excerpt",
        label: "Summary",
        type: "textarea",
        rows: 2,
        hint: "One or two sentences for the post list and link previews.",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "draft", label: "Draft (private)" },
          { value: "published", label: "Published" },
        ],
      },
      {
        name: "publishedAt",
        label: "Publish date",
        type: "date",
        optional: true,
      },
      { name: "tags", label: "Tags", type: "lines" },
      {
        name: "cover",
        label: "Cover image",
        type: "image",
        uploadKind: "image",
        optional: true,
      },
      { name: "coverAlt", label: "Cover description", optional: true },
      { name: "body", label: "Post", type: "markdown", rows: 22 },
    ],
  },
};

/** Sidebar order. */
export const ADMIN_SECTIONS = [
  { path: "profile", ...SINGLETONS.profile },
  { path: "projects", ...LISTS.projects },
  {
    path: "repositories",
    label: "GitHub repos",
    description: "Synced from GitHub. Turn a repo into a project.",
  },
  { path: "experience", ...LISTS.experience },
  { path: "skills", ...LISTS.skills },
  { path: "certifications", ...LISTS.certifications },
  { path: "posts", ...LISTS.posts },
  { path: "photos", ...LISTS.photos },
  { path: "beyond", ...SINGLETONS.beyond },
];
