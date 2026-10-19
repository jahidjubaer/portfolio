import { education as storedEducation } from "../generated/content.json";
import { getOrganization } from "./organizations";
import { byRecency } from "../lib/dates";

/**
 * @typedef {{
 *   id: string,
 *   organization: import("./organizations").Organization,
 *   degree: string,
 *   field?: string,
 *   start?: string,
 *   end?: string,
 *   grade?: string,
 *   activities?: string,
 *   description?: string,
 *   skills?: string[],
 * }} EducationEntry
 */

/**
 * One stored entry, ready to render. A grade is only passed on when Jahid
 * has ticked "Show grade" (CLAUDE.md: confirm before showing CGPA).
 * Shared with the admin's live preview.
 * @param {Record<string, any>} stored
 * @param {(id: string) => import("./organizations").Organization} findOrganization
 * @returns {EducationEntry}
 */
export function resolveEducation(stored, findOrganization) {
  const { organizationId, showGrade, grade, ...entry } = stored;
  delete entry.order;
  return {
    ...entry,
    ...(showGrade && grade ? { grade } : {}),
    organization: findOrganization(organizationId),
  };
}

/**
 * Schools and degrees, most recent first.
 * @type {EducationEntry[]}
 */
export const educationEntries = storedEducation
  .map((stored) => resolveEducation(stored, getOrganization))
  .sort(byRecency);

/** "BSc, Computer Science and Engineering" */
export function degreeLine(entry) {
  return [entry.degree, entry.field].filter(Boolean).join(", ");
}
