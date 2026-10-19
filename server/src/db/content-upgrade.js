/**
 * Upgrades content from the R7 shape to organizations + LinkedIn-style
 * experience (docs/09, P2):
 *
 * - experience: one entry per role → one entry per organization with its
 *   roles; the old "education" entries move to `education`.
 * - certifications: free-text `issuer` → `organizationId`, `category` →
 *   `kind`, and "November 2024"-style dates → "2024-11".
 * - profile.education → the `education` list (nothing is typed twice).
 * - New: `organizations`, `learning` (the "How I learn" steps),
 *   `learningTracks` (empty: tracks come from Jahid, never invented).
 *
 * Pure and idempotent: content already in the new shape is returned as is.
 */

/** "Red Crescent Youth (RCY)" → "red-crescent-youth-rcy" */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** "2024" → "2024", "November 2024" → "2024-11", anything else → undefined */
export function toYearMonth(text) {
  if (!text) return undefined;
  const value = String(text).trim();
  if (/^\d{4}(-\d{2})?$/.test(value)) return value;
  const match = value.match(/^([a-z]+)\s+(\d{4})$/i);
  if (match) {
    const month = MONTHS.indexOf(match[1].toLowerCase());
    if (month >= 0) return `${match[2]}-${String(month + 1).padStart(2, "0")}`;
  }
  return undefined;
}

/** "2023–2024" → ["2023", "2024"]; "August 2026" → ["2026-08"] */
function splitRange(text) {
  return String(text)
    .split(/\s*[–-]\s*(?=[A-Za-z]*\s*\d{4})/)
    .map(toYearMonth);
}

/** "Metropolitan University, Sylhet" → { name, location } */
function splitPlace(text) {
  const [name, ...rest] = String(text).split(/,\s*/);
  return { name, location: rest.join(", ") || undefined };
}

// The default "How I learn" steps (Jahid approved the four-step method on
// 2026-10-19). Editable in the admin under Learning.
export const DEFAULT_LEARNING = {
  steps: [
    {
      title: "Learn",
      description: "Courses, official documentation, and books.",
    },
    {
      title: "Practice",
      description: "Small exercises and problems until the idea sticks.",
    },
    { title: "Build", description: "Use it in a real project." },
    {
      title: "Write",
      description: "Write down what I learned, in my own words.",
    },
  ],
};

function isUpgraded(content) {
  return Array.isArray(content.organizations);
}

/**
 * @param {Record<string, any>} content the stored or exported content
 * @returns {Record<string, any>} the same content in the new shape
 */
export function upgradeContent(content) {
  if (isUpgraded(content)) return content;

  const organizations = [];
  // Experience and school names may end in ", City"; issuers ("EDGE, IICT
  // SUST") are names with commas, so only places are split.
  function organizationFor(text, { isPlace = false } = {}) {
    const { name, location } = isPlace
      ? splitPlace(text)
      : { name: String(text), location: undefined };
    const id = slugify(name);
    if (!organizations.some((organization) => organization.id === id)) {
      organizations.push({
        id,
        order: organizations.length,
        name,
        ...(location ? { location } : {}),
      });
    }
    return id;
  }

  const { education: profileEducation, ...profile } = content.profile;
  const oldExperience = [...(content.experience ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  // Group roles by organization, keeping the first appearance's position.
  const experience = [];
  for (const entry of oldExperience) {
    if (entry.category === "education") continue;
    const organizationId = organizationFor(entry.organization, {
      isPlace: true,
    });
    const [start, end] = splitRange(entry.date);
    const role = {
      title: entry.title,
      ...(entry.category === "community"
        ? { employmentType: "volunteer" }
        : {}),
      start: start ?? String(entry.sortYear),
      ...(end ? { end } : { end: start ?? String(entry.sortYear) }),
      description: entry.details ?? entry.description,
    };
    const existing = experience.find(
      (item) => item.organizationId === organizationId,
    );
    if (existing) {
      existing.roles.push(role);
    } else {
      experience.push({
        id: organizationId,
        order: experience.length,
        organizationId,
        category: entry.category,
        roles: [role],
      });
    }
  }
  for (const item of experience) {
    item.roles.sort((a, b) => b.start.localeCompare(a.start));
  }

  const education = [];
  if (profileEducation) {
    const graduation = toYearMonth(profileEducation.graduation);
    const [degree, ...fieldWords] = profileEducation.degree.split(/\s+in\s+/);
    education.push({
      id: slugify(`${degree} ${splitPlace(profileEducation.university).name}`),
      order: 0,
      organizationId: organizationFor(profileEducation.university, {
        isPlace: true,
      }),
      degree,
      ...(fieldWords.length ? { field: fieldWords.join(" in ") } : {}),
      ...(graduation ? { end: graduation } : {}),
    });
  }

  const certifications = (content.certifications ?? []).map((item) => {
    const { issuer, issued, ...rest } = item;
    delete rest.category;
    const issuedValue = toYearMonth(issued);
    return {
      ...rest,
      organizationId: organizationFor(issuer),
      kind: item.status === "in-progress" ? "course" : "certification",
      ...(issuedValue ? { issued: issuedValue } : {}),
    };
  });

  return {
    ...content,
    profile,
    organizations,
    experience,
    education,
    certifications,
    learning: content.learning ?? DEFAULT_LEARNING,
    learningTracks: content.learningTracks ?? [],
  };
}
