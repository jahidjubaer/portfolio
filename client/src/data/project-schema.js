/**
 * Custom validator for client/src/data/projects.js. No coercion — a
 * project either matches the shape or it produces a descriptive error.
 * See CLAUDE.md content rules: never invent or silently default missing
 * project content.
 */

export const PROJECT_STATUS_VALUES = [
  "live",
  "repository-available",
  "archived",
];
export const CASE_STUDY_STATUS_VALUES = ["complete", "in-preparation", "none"];
export const LINK_TYPE_VALUES = ["live", "repository", "documentation"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isValidUrlOrNull(value) {
  if (value === null) return true;
  if (typeof value !== "string" || value.trim().length === 0) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {import("./projects").ProjectLink[]} links
 * @param {string} slug
 * @returns {string[]}
 */
function validateLinks(links, slug) {
  const errors = [];
  if (!Array.isArray(links)) {
    return [`Project "${slug}": links must be an array.`];
  }
  links.forEach((link, index) => {
    const where = `Project "${slug}" link[${index}]`;
    if (!link || typeof link !== "object") {
      errors.push(`${where}: must be an object.`);
      return;
    }
    if (!isNonEmptyString(link.label)) {
      errors.push(`${where}: label must be a non-empty string.`);
    }
    if (!isValidUrlOrNull(link.url)) {
      errors.push(`${where}: url must be a valid URL string or null.`);
    }
    if (!LINK_TYPE_VALUES.includes(link.type)) {
      errors.push(
        `${where}: type must be one of ${LINK_TYPE_VALUES.join(", ")}.`,
      );
    }
  });
  return errors;
}

/**
 * @param {import("./projects").CaseStudy | null} caseStudy
 * @param {string} slug
 * @param {string} caseStudyStatus
 * @returns {string[]}
 */
function validateCaseStudy(caseStudy, slug, caseStudyStatus) {
  const errors = [];

  if (caseStudyStatus === "none" || caseStudyStatus === "in-preparation") {
    // "in-preparation" projects intentionally have no caseStudy content yet
    // (CLAUDE.md: never invent content to fill a gap) — only "complete"
    // requires the object to actually exist.
    return errors;
  }

  if (!caseStudy || typeof caseStudy !== "object") {
    errors.push(
      `Project "${slug}": caseStudyStatus is "${caseStudyStatus}" but caseStudy is missing.`,
    );
    return errors;
  }

  if (!isNonEmptyString(caseStudy.overview)) {
    errors.push(
      `Project "${slug}": caseStudy.overview must be a non-empty string.`,
    );
  }

  const seenSectionIds = new Set();
  (caseStudy.sections ?? []).forEach((section, index) => {
    const where = `Project "${slug}" caseStudy.sections[${index}]`;
    if (!section || typeof section !== "object") {
      errors.push(`${where}: must be an object.`);
      return;
    }
    if (!isNonEmptyString(section.id)) {
      errors.push(`${where}: id must be a non-empty string.`);
    } else if (seenSectionIds.has(section.id)) {
      errors.push(`${where}: duplicate section id "${section.id}".`);
    } else {
      seenSectionIds.add(section.id);
    }
    if (!isNonEmptyString(section.heading)) {
      errors.push(`${where}: heading must be a non-empty string.`);
    }
  });

  if (caseStudyStatus === "complete") {
    const required = ["overview", "roles", "workflow", "capabilities"];
    required.forEach((field) => {
      const value = caseStudy[field];
      const isEmpty =
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim().length === 0);
      if (isEmpty) {
        errors.push(
          `Project "${slug}": complete case studies require a non-empty caseStudy.${field}.`,
        );
      }
    });
  }

  return errors;
}

/**
 * Validates a full project list. Returns an array of descriptive error
 * strings — empty means valid. Pure function, no throwing, so it can be
 * used directly in tests against fixture data.
 * @param {import("./projects").Project[]} projects
 * @returns {string[]}
 */
export function validateProjects(projects) {
  const errors = [];

  if (!Array.isArray(projects)) {
    return ["Project data must be an array."];
  }

  const slugs = projects.map((project) => project?.slug);
  const seenSlugs = new Set();

  projects.forEach((project, index) => {
    const where = project?.slug
      ? `Project "${project.slug}"`
      : `Project at index ${index}`;

    if (!project || typeof project !== "object") {
      errors.push(`${where}: must be an object.`);
      return;
    }

    if (!isNonEmptyString(project.slug)) {
      errors.push(`${where}: slug must be a non-empty string.`);
    } else if (seenSlugs.has(project.slug)) {
      errors.push(`Duplicate project slug "${project.slug}".`);
    } else {
      seenSlugs.add(project.slug);
    }

    if (!isNonEmptyString(project.title)) {
      errors.push(`${where}: title must be a non-empty string.`);
    }

    if (!isNonEmptyString(project.summary)) {
      errors.push(`${where}: summary must be a non-empty string.`);
    }

    if (!isNonEmptyString(project.projectType)) {
      errors.push(`${where}: projectType must be a non-empty string.`);
    }

    if (!PROJECT_STATUS_VALUES.includes(project.status)) {
      errors.push(
        `${where}: status must be one of ${PROJECT_STATUS_VALUES.join(", ")}.`,
      );
    }

    if (typeof project.featured !== "boolean") {
      errors.push(`${where}: featured must be a boolean.`);
    }

    if (!isStringArray(project.stack)) {
      errors.push(`${where}: stack must be an array of strings.`);
    }

    if (!isStringArray(project.capabilities)) {
      errors.push(`${where}: capabilities must be an array of strings.`);
    }

    errors.push(
      ...validateLinks(project.links ?? [], project.slug ?? `#${index}`),
    );

    if (!CASE_STUDY_STATUS_VALUES.includes(project.caseStudyStatus)) {
      errors.push(
        `${where}: caseStudyStatus must be one of ${CASE_STUDY_STATUS_VALUES.join(", ")}.`,
      );
    } else {
      errors.push(
        ...validateCaseStudy(
          project.caseStudy ?? null,
          project.slug ?? `#${index}`,
          project.caseStudyStatus,
        ),
      );
    }

    if (!Array.isArray(project.relatedSlugs)) {
      errors.push(`${where}: relatedSlugs must be an array.`);
    }

    if (
      !project.seo ||
      !isNonEmptyString(project.seo.title) ||
      !isNonEmptyString(project.seo.description)
    ) {
      errors.push(
        `${where}: seo.title and seo.description must be non-empty strings.`,
      );
    }

    if (project.featured) {
      if (
        !isNonEmptyString(project.summary) ||
        !isStringArray(project.stack) ||
        project.stack.length === 0
      ) {
        errors.push(
          `${where}: featured projects require a non-empty summary and at least one stack entry.`,
        );
      }
    }
  });

  // Related-project slugs must reference real, existing projects.
  projects.forEach((project) => {
    if (!project || !Array.isArray(project.relatedSlugs)) return;
    project.relatedSlugs.forEach((relatedSlug) => {
      if (!slugs.includes(relatedSlug)) {
        errors.push(
          `Project "${project.slug}": relatedSlugs references unknown slug "${relatedSlug}".`,
        );
      }
    });
  });

  return errors;
}

/**
 * Validates project data and either throws (development/test) or logs and
 * returns the data unchanged (production, so a data mistake never crashes
 * the live site). No silent field-level defaulting happens either way.
 * @param {import("./projects").Project[]} projects
 * @returns {import("./projects").Project[]}
 */
export function assertValidProjects(projects) {
  const errors = validateProjects(projects);
  if (errors.length === 0) {
    return projects;
  }

  const message = [
    "Invalid project data:",
    ...errors.map((error) => `- ${error}`),
  ].join("\n");

  if (import.meta.env?.PROD) {
    console.error(message);
    return projects;
  }

  throw new Error(message);
}
