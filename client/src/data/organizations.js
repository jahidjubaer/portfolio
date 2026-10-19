import { organizations as storedOrganizations } from "../generated/content.json";

/**
 * Companies, clubs, schools, and course providers, edited once in the
 * admin and referenced by id from experience, education, certifications,
 * and learning tracks.
 * @typedef {{
 *   id: string,
 *   name: string,
 *   logo?: { url: string, width: number, height: number },
 *   url?: string,
 *   location?: string,
 * }} Organization
 */

/** @type {Organization[]} */
export const organizations = [...storedOrganizations].sort(
  (a, b) => a.order - b.order,
);

const byId = new Map(organizations.map((item) => [item.id, item]));

/**
 * The snapshot schema guarantees every id resolves (findBrokenReferences),
 * so a miss here is a bug, not missing content.
 * @param {string} id
 * @returns {Organization}
 */
export function getOrganization(id) {
  const organization = byId.get(id);
  if (!organization) throw new Error(`Unknown organization "${id}"`);
  return organization;
}
