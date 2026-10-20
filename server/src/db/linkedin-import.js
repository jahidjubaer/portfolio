/**
 * LinkedIn data export → portfolio content (docs/08, R5c). Pure functions
 * with no Node or browser APIs: the admin's import page runs them on CSVs
 * read in the browser, and scripts/import-linkedin.js runs them locally.
 * Only the career files are read; contact details, connections, and
 * messages in the export are never touched.
 */

/** The export files this importer understands. */
export const LINKEDIN_FILES = [
  "Certifications.csv",
  "Education.csv",
  "Organizations.csv",
  "Volunteering.csv",
  "Positions.csv",
];

/**
 * RFC 4180 CSV: quoted fields, doubled quotes, and newlines inside quotes
 * (LinkedIn descriptions have them).
 * @param {string} text
 * @returns {Array<Record<string, string>>} one object per row, keyed by header
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header = [], ...body] = rows.filter((cells) =>
    cells.some((cell) => cell.trim()),
  );
  const keys = header.map((key) => key.trim());
  return body.map((cells) =>
    Object.fromEntries(keys.map((key, i) => [key, (cells[i] ?? "").trim()])),
  );
}

const MONTHS = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

/**
 * LinkedIn dates ("Nov 2024", "2020", "") → "2024-11" | "2020" | undefined.
 * @param {string | undefined} value
 */
export function parseLinkedInDate(value) {
  const text = (value ?? "").trim();
  const monthYear = text.match(/^([A-Za-z]{3})[a-z]*\s+(\d{4})$/);
  if (monthYear && MONTHS[monthYear[1].toLowerCase()]) {
    return `${monthYear[2]}-${MONTHS[monthYear[1].toLowerCase()]}`;
  }
  const year = text.match(/^(\d{4})$/);
  return year ? year[1] : undefined;
}

export function slugify(text) {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Lower-case letters and digits only, for comparing names. */
function loose(text) {
  return (text ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Edit distance, for catching typos ("Wrokshop") and small rewordings. */
function distance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

// Containment needs enough text that "Python" doesn't swallow every
// Python course.
const MIN_CONTAINED = 12;

/**
 * Whether two titles name the same thing: equal after loosening, a typo
 * apart, or one wholly inside the other ("Patrol Leader Course" in
 * "Patrol Leader Course, 5th National Power & Energy Camp").
 */
function similar(a, b) {
  const left = loose(a);
  const right = loose(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const [short, long] =
    left.length < right.length ? [left, right] : [right, left];
  if (short.length >= MIN_CONTAINED && long.includes(short)) return true;
  return distance(left, right) <= Math.max(2, Math.floor(long.length * 0.08));
}

// "Bangladesh" and similar suffixes LinkedIn adds to school names.
const NAME_SUFFIXES = ["bangladesh", "bd"];

function sameName(a, b) {
  let left = loose(a);
  let right = loose(b);
  for (const suffix of NAME_SUFFIXES) {
    if (left.endsWith(suffix)) left = left.slice(0, -suffix.length);
    if (right.endsWith(suffix)) right = right.slice(0, -suffix.length);
  }
  if (!left || !right) return false;
  if (left === right) return true;
  const long = Math.max(left.length, right.length);
  return distance(left, right) <= Math.floor(long * 0.08);
}

/**
 * A role title with its own years in brackets, as LinkedIn users often
 * write them: "Treasurer (2022 - 2025)" → title + dates.
 */
function splitTitleYears(title) {
  const match = title.match(
    /^(.*?)\s*\((\d{4})\s*[-–]\s*(\d{4}|present)?\)\s*$/i,
  );
  if (!match) return { title: title.trim() };
  const end = match[3] && !/present/i.test(match[3]) ? match[3] : undefined;
  return { title: match[1].trim(), start: match[2], end };
}

function uniqueId(base, taken, fallback) {
  const root = base || fallback;
  let id = root;
  for (let n = 2; taken.has(id); n += 1) id = `${root}-${n}`;
  taken.add(id);
  return id;
}

/**
 * Everything the export would add, checked against the current content.
 * Each candidate is a list item ready for the admin API, plus the new
 * organizations it needs. Items already on the site come back with
 * `exists: true` so the page can show (and skip) them.
 *
 * @param {Record<string, string>} files CSV text by file name
 * @param {{ organizations?: any[], certifications?: any[], education?: any[], experience?: any[] }} content
 * @returns {{
 *   candidates: Array<{
 *     key: string,
 *     collection: "certifications" | "education" | "experience",
 *     label: string,
 *     detail: string,
 *     exists: boolean,
 *     item: Record<string, any>,
 *     newOrganization: { id: string, name: string } | null,
 *     note?: string,
 *   }>,
 *   skipped: Array<{ file: string, label: string, reason: string }>,
 * }}
 */
export function buildLinkedInImport(files, content) {
  const organizations = [...(content.organizations ?? [])];
  const orgIds = new Set(organizations.map((org) => org.id));
  const ids = {
    certifications: new Set((content.certifications ?? []).map((i) => i.id)),
    education: new Set((content.education ?? []).map((i) => i.id)),
    experience: new Set((content.experience ?? []).map((i) => i.id)),
  };
  const candidates = [];
  const skipped = [];

  /** Existing org by name, or a new one (shared by later rows). */
  function organizationFor(rawName) {
    // "Abu Abbas College , Netrokuna" → "Abu Abbas College, Netrokuna"
    const name = rawName.replace(/\s+,/g, ",").replace(/\s+/g, " ").trim();
    const found = organizations.find((org) => sameName(org.name, name));
    if (found) return { id: found.id, created: null };
    const created = {
      id: uniqueId(slugify(name), orgIds, "organization"),
      name,
    };
    organizations.push({ ...created, isNew: true });
    return { id: created.id, created };
  }

  function orgNameOf(id) {
    return organizations.find((org) => org.id === id)?.name ?? id;
  }

  function newOrgFor(created, id) {
    if (created) return created;
    const org = organizations.find((entry) => entry.id === id);
    return org?.isNew ? { id: org.id, name: org.name } : null;
  }

  const rows = (name) => (files[name] ? parseCsv(files[name]) : []);

  for (const row of rows("Certifications.csv")) {
    const title = row.Name;
    if (!title) continue;
    const issued =
      parseLinkedInDate(row["Started On"]) ??
      parseLinkedInDate(row["Finished On"]);
    if (!issued) {
      skipped.push({
        file: "Certifications.csv",
        label: title,
        reason: "No issue date in LinkedIn.",
      });
      continue;
    }
    const exists = (content.certifications ?? []).some((cert) =>
      similar(cert.title, title),
    );
    const { id: organizationId, created } = organizationFor(row.Authority);
    candidates.push({
      key: `certifications/${title}`,
      collection: "certifications",
      label: title,
      detail: `${orgNameOf(organizationId)} · ${issued}`,
      exists,
      newOrganization: exists ? null : newOrgFor(created, organizationId),
      item: {
        id: uniqueId(
          slugify(`${title}`),
          ids.certifications,
          `${slugify(row.Authority)}-${issued}`,
        ),
        title,
        organizationId,
        kind: "certification",
        status: "completed",
        issued,
        ...(row["License Number"]
          ? { credentialId: row["License Number"] }
          : {}),
        ...(/^https?:\/\//.test(row.Url) ? { credentialUrl: row.Url } : {}),
      },
    });
  }

  for (const row of rows("Education.csv")) {
    const school = row["School Name"];
    if (!school) continue;
    const { id: organizationId, created } = organizationFor(school);
    const degree = row["Degree Name"] || "Studies";
    const start = parseLinkedInDate(row["Start Date"]);
    const end = parseLinkedInDate(row["End Date"]);
    // Same school, or the same degree started the same year (the school
    // may be spelled differently on the site).
    const exists = (content.education ?? []).some(
      (entry) =>
        entry.organizationId === organizationId ||
        (entry.start?.slice(0, 4) === start?.slice(0, 4) &&
          similar(entry.degree, degree)),
    );
    candidates.push({
      key: `education/${school}`,
      collection: "education",
      label: `${degree}, ${orgNameOf(organizationId)}`,
      detail: [start, end].filter(Boolean).join(" – "),
      exists,
      newOrganization: exists ? null : newOrgFor(created, organizationId),
      item: {
        id: uniqueId(
          slugify(`${degree} ${school}`),
          ids.education,
          "education",
        ),
        organizationId,
        degree,
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
        ...(row.Activities ? { activities: row.Activities } : {}),
        ...(row.Notes ? { description: row.Notes } : {}),
      },
    });
  }

  /** Organizations / Volunteering / Positions rows → one experience entry. */
  function addExperience(file, row, { orgName, title, category, description }) {
    if (!orgName || !title) return;
    const { id: organizationId, created } = organizationFor(orgName);
    const parsed = splitTitleYears(title);
    const start = parsed.start ?? parseLinkedInDate(row["Started On"]);
    const end = parsed.start
      ? parsed.end
      : parseLinkedInDate(row["Finished On"]);
    if (!start) {
      skipped.push({
        file,
        label: `${title}, ${orgName}`,
        reason: "No start date.",
      });
      return;
    }
    // The same organization, or a role with a matching title that started
    // the same year (the site may file it under a different organization,
    // e.g. RCY vs. the Red Crescent Society).
    const exists = (content.experience ?? []).some(
      (entry) =>
        entry.organizationId === organizationId ||
        (entry.roles ?? []).some(
          (role) =>
            role.start?.slice(0, 4) === start.slice(0, 4) &&
            (loose(parsed.title).includes(loose(role.title)) ||
              loose(role.title).includes(loose(parsed.title))),
        ),
    );
    candidates.push({
      key: `experience/${orgName}/${title}`,
      collection: "experience",
      label: `${parsed.title}, ${orgNameOf(organizationId)}`,
      detail: `${start} – ${end ?? "present"}`,
      exists,
      note: exists
        ? "This organization is already in Experience; add the role there if it's missing."
        : undefined,
      newOrganization: exists ? null : newOrgFor(created, organizationId),
      item: {
        id: uniqueId(slugify(orgName), ids.experience, "experience"),
        organizationId,
        category,
        roles: [
          {
            title: parsed.title,
            start,
            ...(end ? { end } : { current: true }),
            ...(description ? { description } : {}),
          },
        ],
      },
    });
  }

  for (const row of rows("Organizations.csv")) {
    addExperience("Organizations.csv", row, {
      orgName: row.Name,
      title: row.Position,
      category: "leadership",
      description: row.Description,
    });
  }
  for (const row of rows("Volunteering.csv")) {
    addExperience("Volunteering.csv", row, {
      orgName: row["Company Name"],
      title: row.Role,
      category: "community",
      description: row.Description,
    });
  }
  for (const row of rows("Positions.csv")) {
    addExperience("Positions.csv", row, {
      orgName: row["Company Name"],
      title: row.Title,
      category: "work",
      description: row.Description,
    });
  }

  return { candidates, skipped };
}
