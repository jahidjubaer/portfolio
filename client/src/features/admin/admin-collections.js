import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CircleUserRound,
  FolderGit2,
  GraduationCap,
  Images,
  Import,
  Inbox,
  Layers,
  Mountain,
  NotebookPen,
  Package,
  PenLine,
  Route as RouteIcon,
  Settings2,
  Sprout,
} from "lucide-react";
// The admin validates with the exact schemas the API enforces.
import {
  beyondSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  learningSchema,
  learningTrackSchema,
  organizationSchema,
  studyLogSchema,
  photoSchema,
  postSchema,
  profileSchema,
  projectSchema,
  settingsSchema,
  skillGroupSchema,
  SOCIAL_NETWORKS,
} from "../../../../server/src/schemas/content.js";
import {
  NAV_ITEMS,
  PROFILE_SECTIONS,
} from "../../../../server/src/schemas/settings-defaults.js";
import {
  blankTemplateSections,
  templateHint,
} from "../../../../server/src/schemas/case-study-template.js";
import {
  ACCENT_OPTIONS,
  FONT_OPTIONS,
} from "../preferences/appearance-options";
import { organizationUsage } from "./attention";
import { siteDateKey } from "../learning-tracks/journal";
import { StudyLogQuickAdd } from "./StudyLogQuickAdd";
import { isPrivate, syllabusTopics, trackOptions } from "./journal-options";

const SOCIAL_LABELS = {
  github: "GitHub",
  linkedin: "LinkedIn",
  codeforces: "Codeforces",
  vjudge: "VJudge",
  leetcode: "LeetCode",
  facebook: "Facebook",
  instagram: "Instagram",
};
const SOCIAL_OPTIONS = SOCIAL_NETWORKS.map((value) => ({
  value,
  label: SOCIAL_LABELS[value],
}));

/** The synced GitHub repos (forks left out), as checkbox options. */
function repoOptions(content, selected = []) {
  const names = (content.repositories?.repos ?? [])
    .filter((repo) => !repo.fork)
    .map((repo) => repo.name);
  // A connected repo that's gone from the sync still shows, so it can be unticked.
  return [...new Set([...names, ...selected])].map((name) => ({
    value: name,
    label: name,
  }));
}

/** The synced repos (forks left out), for the project repo picker. */
function repoChoices(content) {
  return (content.repositories?.repos ?? [])
    .filter((repo) => !repo.fork)
    .map((repo) => ({ name: repo.name, url: repo.url }));
}

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
      {
        name: "problemSolvingHeading",
        type: "heading",
        label: "Problem solving",
        hint: "Live numbers are synced daily from these accounts (GitHub repos page → Sync coding stats).",
      },
      {
        name: "problemSolving.total",
        label: "Problem solving (headline)",
        hint: "Only shown before the first sync. After it, the headline is the synced count of distinct problems (plus Dimik OJ).",
      },
      { name: "problemSolving.primaryLanguage", label: "Main language" },
      { name: "problemSolving.platforms", label: "Platforms" },
      {
        name: "problemSolving.codeforcesHandle",
        label: "Codeforces handle",
        optional: true,
        half: true,
      },
      {
        name: "problemSolving.vjudgeHandle",
        label: "VJudge username",
        optional: true,
        half: true,
      },
      {
        name: "problemSolving.practiceRepo",
        label: "Solutions repo on GitHub",
        optional: true,
        half: true,
        hint: 'Repo name only, e.g. "Programming".',
      },
      {
        name: "problemSolving.dimikSolved",
        label: "Dimik OJ problems solved",
        type: "number",
        optional: true,
        half: true,
        hint: "Dimik OJ isn't synced: type the count from your Dimik profile. Shown as its own card and added to the headline.",
      },
      {
        name: "problemSolving.dimikTotal",
        label: "Dimik OJ problems available",
        type: "number",
        optional: true,
        half: true,
        hint: "The judge's total problem count, shown as solved / total (e.g. 40 / 52). Leave blank to show only the solved count.",
      },
      {
        name: "problemSolving.status",
        label: "Practice status",
        type: "select",
        optional: true,
        half: true,
        options: [
          { value: "active", label: "Active — practising now" },
          { value: "paused", label: "Paused — show as an archive" },
        ],
      },
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
          {
            name: "hidden",
            label: "Hide on the site (keep it here)",
            type: "checkbox",
            optional: true,
          },
        ],
      },
    ],
  },
  learning: {
    label: "How I learn",
    description: "The steps at the top of the Learning page.",
    schema: learningSchema,
    fields: [
      {
        name: "intro",
        label: "Intro",
        type: "textarea",
        rows: 3,
        optional: true,
      },
      {
        name: "steps",
        label: "Steps",
        type: "objectList",
        itemLabel: "step",
        fields: [
          { name: "title", label: "Step" },
          {
            name: "description",
            label: "What it means for you",
            type: "textarea",
            rows: 2,
          },
        ],
      },
    ],
  },
  settings: {
    label: "Site settings",
    description:
      "Defaults for visitors, the opening animation, what the profile and menus show, and link previews.",
    schema: settingsSchema,
    fields: [
      {
        name: "appearanceHeading",
        type: "heading",
        label: "Appearance",
        hint: "What visitors see first. Anyone can still change these in the Appearance menu.",
      },
      {
        name: "appearance.theme",
        label: "Default theme",
        type: "select",
        half: true,
        options: [
          { value: "system", label: "Follow the visitor's device" },
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
        ],
      },
      {
        name: "appearance.accent",
        label: "Default accent colour",
        type: "select",
        half: true,
        options: ACCENT_OPTIONS.map((option) => ({
          value: option.id,
          label: option.label,
        })),
      },
      {
        name: "appearance.font",
        label: "Default font",
        type: "select",
        half: true,
        options: FONT_OPTIONS.map((option) => ({
          value: option.id,
          label: option.label,
        })),
      },
      { name: "introHeading", type: "heading", label: "Opening animation" },
      {
        name: "intro.enabled",
        label: "Play the opening animation (once per visit)",
        type: "checkbox",
      },
      {
        name: "intro.sound",
        label: "With its sound (shutter or paper), when the browser allows it",
        type: "checkbox",
      },
      {
        name: "intro.style",
        label: "Style",
        type: "select",
        half: true,
        options: [
          { value: "aperture", label: "Camera aperture" },
          { value: "torn", label: "Torn pages" },
          { value: "split", label: "Clean split" },
        ],
      },
      {
        name: "profileHeading",
        type: "heading",
        label: "Profile page",
        hint: "Order and show or hide the sections of the Resume tab.",
      },
      {
        name: "profileSections",
        label: "Sections",
        type: "objectList",
        fixed: true,
        itemTitle: (item) =>
          PROFILE_SECTIONS.find((section) => section.id === item.id)?.label ??
          item.id,
        fields: [{ name: "visible", label: "Show", type: "checkbox" }],
      },
      {
        name: "showGithubActivity",
        label: 'Show the "Recently on GitHub" card',
        type: "checkbox",
      },
      {
        name: "openToWorkBadge",
        label: 'Show the "Open to new roles" badge',
        type: "checkbox",
        hint: "On the profile, the contact page, and the side card.",
      },
      {
        name: "navigationHeading",
        type: "heading",
        label: "Menus",
        hint: "Rename pages or hide them from the menus. Hidden pages still open from a direct link. Profile always shows.",
      },
      ...NAV_ITEMS.flatMap((item) => [
        {
          name: `navigation.${item.id}.label`,
          label: `${item.label} page: menu label`,
          half: true,
        },
        {
          name: `navigation.${item.id}.visible`,
          label: `Show ${item.label} in menus (${item.path})`,
          type: "checkbox",
          half: true,
        },
      ]),
      {
        name: "showcaseHeading",
        type: "heading",
        label: "Writing & Beyond samples",
        hint: "Show a few of the newest posts and photos, with a card linking to the original site for the rest.",
      },
      ...[
        ["posts", "Writing", "posts"],
        ["photos", "Beyond", "photos"],
      ].flatMap(([id, page, noun]) => [
        {
          name: `showcase.${id}.limit`,
          label: `${page}: ${noun} to show`,
          type: "number",
          half: true,
        },
        {
          name: `showcase.${id}.siteUrl`,
          label: `${page}: original site`,
          type: "url",
          optional: true,
          half: true,
        },
        {
          name: `showcase.${id}.siteLabel`,
          label: `${page}: site name`,
          optional: true,
          half: true,
        },
        {
          name: `showcase.${id}.siteDescription`,
          label: `${page}: card text`,
          optional: true,
          half: true,
        },
      ]),
      { name: "syncHeading", type: "heading", label: "Daily sync" },
      {
        name: "autoPublishAfterSync",
        label:
          "Publish the site after the daily sync when GitHub or coding numbers changed",
        type: "checkbox",
      },
      { name: "seoHeading", type: "heading", label: "Search & link previews" },
      {
        name: "seo.homeDescription",
        label: "Home page description",
        type: "textarea",
        rows: 3,
        optional: true,
        hint: "Shown by Google and in link previews. About 150–160 characters. Leave empty for the built-in one.",
      },
      {
        name: "seo.shareImage",
        label: "Link preview image",
        type: "image",
        uploadKind: "image",
        optional: true,
        hint: "1200 × 630 works best. Leave empty for the built-in one.",
      },
    ],
  },
  beyond: {
    label: "Beyond",
    description:
      "Sports, volunteering, languages, and interests on the Beyond page.",
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
      {
        name: "languages",
        label: "Languages",
        type: "objectList",
        itemLabel: "language",
        fields: [
          { name: "name", label: "Language", half: true },
          {
            name: "level",
            label: "Level",
            half: true,
            hint: 'e.g. "Native" or "Upper-intermediate (B2)"',
          },
        ],
      },
      { name: "interests", label: "Interests", type: "lines" },
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
 * null. Blank anchors come from the heading.
 */
export function normalizeProject(project) {
  const caseStudy = project.caseStudy ?? {};
  const sections = (caseStudy.sections ?? []).map((section) => ({
    ...section,
    id: section.id || slugify(section.heading),
  }));
  const isEmpty =
    sections.length === 0 && !caseStudy.role && !caseStudy.timeline;
  const architecture = caseStudy.architecture;
  const hasArchitecture =
    architecture?.nodes?.length > 0 || architecture?.steps?.length > 0;
  return {
    ...project,
    caseStudy: isEmpty
      ? null
      : {
          ...caseStudy,
          sections,
          architecture: hasArchitecture ? architecture : undefined,
        },
  };
}

const NEW_PROJECT = {
  status: "repository-available",
  featured: false,
  caseStudyStatus: "none",
  caseStudy: { sections: blankTemplateSections() },
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

/** An organization's certifications and courses, linked to their editors. */
function issuedBy(content, id) {
  if (!id) return [];
  return (content.certifications ?? [])
    .filter((entry) => entry.organizationId === id)
    .map((entry) => ({
      label: entry.title,
      detail: [
        entry.kind === "course" ? "Course" : "Certification",
        entry.status === "in-progress" ? "in progress" : entry.issued,
      ]
        .filter(Boolean)
        .join(" · "),
      to: `/admin/certifications/${encodeURIComponent(entry.id)}`,
    }));
}

/** Organizations as select options, for "Organization" pickers. */
function organizationOptions(content) {
  return (content.organizations ?? []).map((item) => ({
    value: item.id,
    label: item.name,
  }));
}

function organizationName(content, id) {
  return content.organizations?.find((item) => item.id === id)?.name ?? id;
}

const CERTIFICATION_CATEGORY_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "leadership-community", label: "Leadership & community" },
];
const CATEGORY_LABELS = Object.fromEntries(
  CERTIFICATION_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
);

const ORGANIZATION_HINT =
  "Not in the list? Use New organization; add its logo later under Organizations.";

// "2024" or "2024-06"; durations on the site are worked out from these.
const DATE_HINT = "Year, or year-month: 2024 or 2024-06.";

// Missing means public; "private" items are never exported to the site.
const VISIBILITY_FIELD = {
  name: "visibility",
  label: "Visibility",
  type: "select",
  optional: true,
  emptyLabel: "Public",
  options: [{ value: "private", label: "Private (only here in the admin)" }],
};

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "self-employed", label: "Self-employed" },
  { value: "volunteer", label: "Volunteer" },
];

const WORKPLACE_OPTIONS = [
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

/** "2023 – 2025", "2024 – present" for list subtitles. */
function spanOf(roles) {
  const starts = roles.map((role) => role.start).sort();
  const current = roles.some((role) => role.current);
  const ends = roles
    .map((role) => role.end)
    .filter(Boolean)
    .sort();
  return `${starts[0]} – ${current ? "present" : ends.at(-1)}`;
}

/** Ordered lists: a list page plus an add/edit form per item. */
export const LISTS = {
  projects: {
    label: "Projects",
    // A hidden project has no public page yet.
    viewOnSite: (item) => (item.hidden ? null : `/work/${item.slug}`),
    itemLabel: "project",
    description: "Order, featured projects, links, and case studies.",
    keyField: "slug",
    schema: projectSchema,
    normalize: normalizeProject,
    titleOf: (item) => item.title,
    subtitleOf: (item) =>
      [
        item.hidden ? "Hidden" : null,
        item.featured ? "Featured" : null,
        item.status,
      ]
        .filter(Boolean)
        .join(" · "),
    // Router state from the GitHub repos page's "Add as project".
    newItem: (state) =>
      state?.fromRepo ? projectFromRepo(state.fromRepo) : NEW_PROJECT,
    prefilledNote: (state) =>
      state?.fromRepo
        ? `Prefilled from ${state.fromRepo.name} on GitHub. Check every field and write the summary in your own words before saving.`
        : undefined,
    aiDraft: "project",
    fields: (content) => [
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
      {
        name: "hidden",
        label: "Hidden until ready (kept here, left off the site)",
        type: "checkbox",
        optional: true,
      },
      {
        name: "cover",
        label: "Cover image",
        type: "image",
        uploadKind: "image",
        smallWidth: 640,
        optional: true,
        hint: "The project's one picture: its card, the case study, and nowhere else. A 16:9 screenshot of the main screen works best. A 640 px copy is made for cards.",
      },
      {
        name: "coverAlt",
        label: "Cover image description",
        optional: true,
        hint: "What the picture shows, for people who can't see it, e.g. “Sarabo’s customer dashboard listing two repair requests”.",
      },
      { name: "stack", label: "Tech stack", type: "lines" },
      { name: "capabilities", label: "Key features", type: "lines" },
      { name: "roleContext", label: "Your role", optional: true },
      {
        name: "repoPicker",
        for: "links",
        label: "GitHub repositories",
        type: "repoLinks",
        hint: "Any number of synced repos, e.g. a client and a server. They're saved as repository links (listed under Links too), and Draft with AI reads all of them.",
        repos: repoChoices(content),
        username: content.repositories?.username ?? "",
      },
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
        hint: "Every case study uses five sections: Problem, What I built, How it works, The hard part, Result and next. Keep each one short and factual. A section left blank isn't shown on the site.",
        fields: [
          { name: "heading", label: "Heading" },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: [
              { value: "text", label: "Text (Markdown)" },
              { value: "diagram", label: "Architecture diagram" },
            ],
          },
          {
            name: "body",
            label: "Text",
            type: "markdown",
            rows: 8,
            optional: true,
            hint: "A diagram section shows this text above the diagram.",
            hintFor: (section) => templateHint(section?.id),
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
        name: "caseStudy.architecture.nodes",
        label: "Architecture diagram: parts",
        type: "objectList",
        itemLabel: "part",
        itemTitle: (part) => part.label || undefined,
        hint: "Shown by a section of type Architecture diagram. Each part is a box on a 3 × 3 grid (column 1 is the left, row 1 the top).",
        fields: [
          {
            name: "id",
            label: "ID",
            half: true,
            hint: 'Short name the steps use, e.g. "api"',
          },
          { name: "label", label: "Label", half: true },
          { name: "column", label: "Column (1–3)", type: "number", half: true },
          { name: "row", label: "Row (1–3)", type: "number", half: true },
        ],
      },
      {
        name: "caseStudy.architecture.steps",
        label: "Architecture diagram: steps",
        type: "objectList",
        itemLabel: "step",
        hint: "The flow between the parts, in order. The case study draws one step at a time as the reader scrolls. Only real, confirmed connections.",
        fields: [
          { name: "from", label: "From (part ID)", half: true },
          { name: "to", label: "To (part ID)", half: true },
          { name: "label", label: "What happens" },
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
  organizations: {
    label: "Organizations",
    itemLabel: "organization",
    description:
      "Companies, clubs, schools, and course providers: name, logo, and link, used everywhere.",
    keyField: "id",
    schema: organizationSchema,
    titleOf: (item) => item.name,
    subtitleOf: (item, content) => {
      const uses = organizationUsage(content, item.id);
      return [
        uses
          ? `Used in ${uses} ${uses === 1 ? "place" : "places"}`
          : "Not used yet",
        item.location,
        item.logo ? null : "No logo yet",
      ]
        .filter(Boolean)
        .join(" · ");
    },
    thumbnailOf: (item) => item.logo,
    newItem: {},
    fields: (content, item) => [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      { name: "name", label: "Name" },
      {
        name: "logo",
        label: "Logo",
        type: "image",
        uploadKind: "image",
        optional: true,
        hint: "A square PNG or WebP works best. Without one, initials are shown.",
      },
      {
        name: "url",
        label: "Website",
        type: "url",
        optional: true,
        hint: "Its website, LinkedIn, or Facebook page.",
      },
      { name: "location", label: "Location", optional: true },
      {
        name: "issued",
        label: "Certifications & courses it issued",
        type: "related",
        empty: "None yet.",
        items: issuedBy(content, item?.id),
      },
    ],
  },
  experience: {
    label: "Experience",
    viewOnSite: () => "/#experience",
    itemLabel: "experience",
    description:
      "One entry per organization, with every role you held there (LinkedIn style).",
    keyField: "id",
    schema: experienceSchema,
    titleOf: (item, content) => organizationName(content, item.organizationId),
    subtitleOf: (item) =>
      `${item.roles.length} ${item.roles.length === 1 ? "role" : "roles"} · ${spanOf(item.roles)}`,
    // The site sorts experience by date, so manual ordering doesn't apply.
    sortable: false,
    compare: (a, b) => spanOf(b.roles).localeCompare(spanOf(a.roles)),
    newItem: () => ({ category: "leadership", roles: [{}] }),
    fields: (content) => [
      {
        name: "id",
        label: "ID",
        hint: KEY_HINT,
        readOnlyWhenEditing: true,
      },
      {
        name: "organizationId",
        label: "Organization",
        type: "select",
        placeholder: "Choose an organization…",
        options: organizationOptions(content),
        quickAdd: "organizations",
        hint: ORGANIZATION_HINT,
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "work", label: "Work" },
          { value: "leadership", label: "Leadership" },
          { value: "community", label: "Community / volunteering" },
        ],
        hint: "Leadership roles also appear on the Beyond page and the resume.",
      },
      {
        name: "roles",
        label: "Roles",
        type: "objectList",
        itemLabel: "role",
        fields: [
          { name: "title", label: "Title" },
          {
            name: "employmentType",
            label: "Employment type",
            type: "select",
            optional: true,
            options: EMPLOYMENT_TYPE_OPTIONS,
          },
          { name: "start", label: "Start", hint: DATE_HINT, half: true },
          {
            name: "end",
            label: "End",
            optional: true,
            half: true,
            hint: `${DATE_HINT} Leave empty for a role you still hold.`,
          },
          {
            name: "current",
            label: "I currently hold this role",
            type: "checkbox",
            optional: true,
          },
          { name: "location", label: "Location", optional: true, half: true },
          {
            name: "workplace",
            label: "Location type",
            type: "select",
            optional: true,
            half: true,
            options: WORKPLACE_OPTIONS,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            rows: 4,
            optional: true,
          },
          { name: "skills", label: "Skills", type: "lines", rows: 3 },
        ],
      },
    ],
  },
  education: {
    label: "Education",
    viewOnSite: () => "/credentials#education",
    itemLabel: "school",
    description: "Schools and degrees, on the Education & Certifications page.",
    keyField: "id",
    schema: educationSchema,
    titleOf: (item, content) => organizationName(content, item.organizationId),
    subtitleOf: (item) =>
      [item.degree, item.field, item.end].filter(Boolean).join(" · "),
    sortable: false,
    compare: (a, b) => (b.end ?? "").localeCompare(a.end ?? ""),
    newItem: {},
    fields: (content) => [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      {
        name: "organizationId",
        label: "School",
        type: "select",
        placeholder: "Choose a school…",
        options: organizationOptions(content),
        quickAdd: "organizations",
        hint: ORGANIZATION_HINT,
      },
      { name: "degree", label: "Degree", hint: 'e.g. "BSc"' },
      {
        name: "field",
        label: "Field of study",
        optional: true,
        hint: 'e.g. "Computer Science and Engineering"',
      },
      {
        name: "start",
        label: "Start",
        optional: true,
        hint: DATE_HINT,
        half: true,
      },
      {
        name: "end",
        label: "End (or expected)",
        optional: true,
        half: true,
        hint: DATE_HINT,
      },
      { name: "grade", label: "Grade", optional: true },
      {
        name: "showGrade",
        label: "Show the grade on the site",
        type: "checkbox",
        optional: true,
      },
      {
        name: "activities",
        label: "Activities and societies",
        type: "textarea",
        rows: 2,
        optional: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        rows: 3,
        optional: true,
      },
      { name: "skills", label: "Skills", type: "lines", rows: 3 },
    ],
  },
  skills: {
    label: "Skills",
    viewOnSite: () => "/#skills",
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
    viewOnSite: () => "/credentials#certifications",
    itemLabel: "certification",
    description: "Licenses, certificates, and courses, LinkedIn style.",
    keyField: "id",
    schema: certificationSchema,
    titleOf: (item) => item.title,
    subtitleOf: (item, content) =>
      [
        item.kind === "course" ? "Course" : "Certification",
        CATEGORY_LABELS[item.category] ?? "No category yet",
        organizationName(content, item.organizationId),
        item.status === "in-progress" ? "In progress" : item.issued,
        item.featured ? "On profile" : null,
      ]
        .filter(Boolean)
        .join(" · "),
    thumbnailOf: (item) => item.image,
    sortable: false,
    compare: (a, b) => (b.issued ?? "9999").localeCompare(a.issued ?? "9999"),
    newItem: {
      kind: "certification",
      category: "professional",
      status: "completed",
    },
    fields: (content) => [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      { name: "title", label: "Name" },
      {
        name: "organizationId",
        label: "Issuing organization",
        type: "select",
        placeholder: "Choose an organization…",
        options: organizationOptions(content),
        quickAdd: "organizations",
        hint: ORGANIZATION_HINT,
      },
      {
        name: "kind",
        label: "Type",
        type: "select",
        half: true,
        hint: "Certification: an issued certificate or credential. Course: a course or training you took.",
        options: [
          { value: "certification", label: "Certification" },
          { value: "course", label: "Course" },
        ],
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        half: true,
        placeholder: "Choose a category…",
        hint: "Leadership & community: scouting, Red Crescent, clubs, volunteering. Everything else is professional.",
        options: CERTIFICATION_CATEGORY_OPTIONS,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        half: true,
        options: [
          { value: "completed", label: "Completed" },
          { value: "in-progress", label: "In progress" },
        ],
      },
      {
        name: "issued",
        label: "Issue date",
        optional: true,
        hint: DATE_HINT,
        half: true,
      },
      {
        name: "expires",
        label: "Expiration date",
        optional: true,
        half: true,
        hint: DATE_HINT,
      },
      { name: "credentialId", label: "Credential ID", optional: true },
      {
        name: "credentialUrl",
        label: "Credential URL",
        type: "url",
        optional: true,
        hint: "A real verification link only. It becomes the Show credential button.",
      },
      {
        name: "courseUrl",
        label: "Course page",
        type: "url",
        optional: true,
        hint: "The course's own page, e.g. on Coursera. It becomes the Course page button.",
      },
      {
        name: "description",
        label: "What it covered",
        type: "textarea",
        rows: 2,
        optional: true,
      },
      { name: "skills", label: "Skills", type: "lines", rows: 3 },
      {
        name: "image",
        label: "Certificate image",
        type: "image",
        uploadKind: "image",
        optional: true,
      },
      {
        name: "imageAlt",
        label: "Certificate image description",
        optional: true,
      },
      {
        name: "featured",
        label: "Show on the profile (strongest few only)",
        type: "checkbox",
        optional: true,
      },
    ],
  },
  learningTracks: {
    label: "Learning tracks",
    viewOnSite: () => "/learning",
    itemLabel: "track",
    description:
      "What you're learning: resources, practice, what you built, and notes.",
    keyField: "id",
    schema: learningTrackSchema,
    titleOf: (item) => item.title,
    subtitleOf: (item) => {
      const done = (item.syllabus ?? []).filter(
        (topic) => topic.status === "done",
      ).length;
      return [
        {
          learning: "Now learning",
          applied: "Applied",
          exploring: "Exploring",
        }[item.status],
        item.syllabus?.length
          ? `${done} of ${item.syllabus.length} topics done`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
    },
    isPrivate,
    newItem: (state) => ({
      status: "learning",
      resources: [],
      certificationIds: [],
      projectSlugs: [],
      notes: [],
      repos: state?.fromRepo ? [state.fromRepo.name] : [],
      ...(state?.fromRepo
        ? {
            id: slugify(state.fromRepo.name),
            title: state.fromRepo.name,
            summary: state.fromRepo.description ?? undefined,
            since: state.fromRepo.createdAt?.slice(0, 7),
          }
        : {}),
    }),
    prefilledNote: (state) =>
      state?.fromRepo
        ? `Connected to ${state.fromRepo.name} on GitHub. Use “Draft with AI” or write the topic in your own words.`
        : undefined,
    aiDraft: "learning",
    fields: (content, item) => [
      { name: "id", label: "ID", hint: KEY_HINT, readOnlyWhenEditing: true },
      { name: "title", label: "Topic", hint: 'e.g. "Advanced React"' },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "learning", label: "Now learning" },
          { value: "applied", label: "Applied (done, used in projects)" },
          { value: "exploring", label: "Exploring" },
        ],
      },
      { name: "since", label: "Since", optional: true, hint: DATE_HINT },
      {
        ...VISIBILITY_FIELD,
        hint: "A private track and all its log entries stay in the admin.",
      },
      {
        name: "summary",
        label: "Summary",
        type: "textarea",
        rows: 2,
        optional: true,
      },
      {
        name: "goal",
        label: "Goal",
        optional: true,
        hint: 'What finishing looks like, e.g. "Build a full-stack app with auth".',
      },
      {
        name: "syllabus",
        label: "Topics (syllabus)",
        type: "objectList",
        itemLabel: "topic",
        hint: "In order. Progress on the site is done topics out of all of them. Mark one as Studying now.",
        fields: [
          { name: "title", label: "Topic" },
          {
            name: "status",
            label: "Status",
            type: "select",
            half: true,
            options: [
              { value: "todo", label: "To do" },
              { value: "doing", label: "Studying now" },
              { value: "done", label: "Done" },
            ],
          },
          {
            name: "date",
            label: "Finished on",
            type: "date",
            optional: true,
            half: true,
          },
        ],
      },
      {
        name: "resources",
        label: "Learned from",
        type: "objectList",
        itemLabel: "resource",
        fields: [
          { name: "label", label: "Name", hint: 'e.g. "React docs"' },
          { name: "url", label: "Link", type: "url", optional: true },
          {
            name: "organizationId",
            label: "Provider",
            type: "select",
            optional: true,
            options: organizationOptions(content),
            quickAdd: "organizations",
          },
        ],
      },
      {
        name: "certificationIds",
        label: "Related certifications & courses",
        type: "checkboxes",
        options: (content.certifications ?? []).map((item) => ({
          value: item.id,
          label: item.title,
        })),
      },
      {
        name: "practice",
        label: "Practice",
        type: "textarea",
        rows: 2,
        optional: true,
        hint: "How you practised it: exercises, problems, small builds.",
      },
      {
        name: "projectSlugs",
        label: "Built with it",
        type: "checkboxes",
        options: (content.projects ?? []).map((item) => ({
          value: item.slug,
          label: item.title,
        })),
      },
      {
        name: "notes",
        label: "Notes written",
        type: "objectList",
        itemLabel: "note",
        fields: [
          { name: "label", label: "Title" },
          { name: "url", label: "Link", type: "url" },
        ],
      },
      {
        name: "repos",
        label: "Code on GitHub",
        type: "checkboxes",
        hint: "Repos from the GitHub sync. The Learning page shows each with its language and last update.",
        options: repoOptions(content, item?.repos),
      },
    ],
  },
  studyLog: {
    label: "Study log",
    viewOnSite: () => "/learning#study-log",
    itemLabel: "entry",
    description:
      "What you studied, day by day. Public entries fill the calendar and log on the Learning page.",
    keyField: "id",
    schema: studyLogSchema,
    titleOf: (item) => item.topic || item.body.split("\n")[0].slice(0, 80),
    subtitleOf: (item, content) =>
      [
        item.date,
        content.learningTracks?.find((track) => track.id === item.trackId)
          ?.title ?? item.trackId,
        item.minutes ? `${item.minutes} min` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    isPrivate,
    // Newest first, like a diary.
    sortable: false,
    compare: (a, b) => b.date.localeCompare(a.date) || b.order - a.order,
    quickAdd: StudyLogQuickAdd,
    newItem: () => ({
      id: `log-${Date.now().toString(36)}`,
      date: siteDateKey(new Date()),
      links: [],
    }),
    fields: (content) => [
      {
        name: "date",
        label: "Date",
        type: "date",
        half: true,
      },
      {
        name: "minutes",
        label: "Time spent (minutes)",
        type: "number",
        optional: true,
        half: true,
      },
      {
        name: "trackId",
        label: "Track",
        type: "select",
        placeholder: "Choose a track…",
        options: trackOptions(content),
      },
      {
        name: "topic",
        label: "Topic",
        optional: true,
        suggestions: syllabusTopics(content),
        hint: "One of the track's topics, or anything else.",
      },
      {
        name: "body",
        label: "What I studied",
        type: "markdown",
        rows: 8,
      },
      {
        name: "links",
        label: "Links",
        type: "objectList",
        itemLabel: "link",
        hint: "The course, a repo, or your notes.",
        fields: [
          { name: "label", label: "Title" },
          { name: "url", label: "Link", type: "url" },
        ],
      },
      VISIBILITY_FIELD,
    ],
  },
  photos: {
    label: "Photography",
    viewOnSite: () => "/beyond",
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

/** Sidebar groups, in order. Each section is a list, a singleton, or a page. */
export const ADMIN_GROUPS = [
  {
    label: "Site",
    sections: [
      { path: "settings", icon: Settings2, ...SINGLETONS.settings },
      { path: "profile", icon: CircleUserRound, ...SINGLETONS.profile },
      { path: "beyond", icon: Mountain, ...SINGLETONS.beyond },
      {
        path: "messages",
        icon: Inbox,
        label: "Messages",
        description: "What visitors sent through the contact form.",
      },
    ],
  },
  {
    label: "Career",
    sections: [
      { path: "organizations", icon: Building2, ...LISTS.organizations },
      { path: "experience", icon: BriefcaseBusiness, ...LISTS.experience },
      { path: "education", icon: GraduationCap, ...LISTS.education },
      { path: "certifications", icon: BadgeCheck, ...LISTS.certifications },
      { path: "skills", icon: Layers, ...LISTS.skills },
      {
        path: "linkedin-import",
        icon: Import,
        label: "Import from LinkedIn",
        description:
          "Add certifications, roles, and education from your LinkedIn data export.",
      },
    ],
  },
  {
    label: "Work",
    sections: [
      { path: "projects", icon: Package, ...LISTS.projects },
      {
        path: "repositories",
        icon: FolderGit2,
        label: "GitHub repos",
        description: "Synced from GitHub. Turn a repo into a project.",
      },
    ],
  },
  {
    label: "Learning",
    sections: [
      { path: "learning", icon: RouteIcon, ...SINGLETONS.learning },
      { path: "learningTracks", icon: Sprout, ...LISTS.learningTracks },
      { path: "studyLog", icon: NotebookPen, ...LISTS.studyLog },
      { path: "posts", icon: PenLine, ...LISTS.posts },
    ],
  },
  {
    label: "Media",
    sections: [{ path: "photos", icon: Images, ...LISTS.photos }],
  },
];

/** Every section in sidebar order. */
export const ADMIN_SECTIONS = ADMIN_GROUPS.flatMap((group) => group.sections);
