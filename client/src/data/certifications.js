import { certifications as storedCertifications } from "../generated/content.json";
import { getOrganization } from "./organizations";

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   organization: import("./organizations").Organization,
 *   kind: "certification" | "course",
 *   category: "professional" | "leadership-community",
 *   status: "completed" | "in-progress",
 *   issued?: string,
 *   expires?: string,
 *   credentialId?: string,
 *   credentialUrl?: string,
 *   courseUrl?: string,
 *   description?: string,
 *   skills?: string[],
 *   image?: { url: string, width: number, height: number },
 *   imageAlt?: string,
 * }} Certification
 */

/**
 * One stored certification, ready to render. Shared with the admin's
 * live preview.
 * @param {Record<string, any>} stored
 * @param {(id: string) => import("./organizations").Organization} findOrganization
 * @returns {Certification}
 */
export function resolveCertification(stored, findOrganization) {
  const { organizationId, ...item } = stored;
  delete item.order;
  return {
    ...item,
    // Until the docs/11 category migration is applied (the admin flags it).
    category: item.category ?? "professional",
    organization: findOrganization(organizationId),
  };
}

const recency = (item) =>
  item.status === "in-progress" ? "9999" : (item.issued ?? "0000");

/**
 * Licenses, certificates, and courses as LinkedIn orders them: in progress
 * first, then the most recently issued.
 * @type {Certification[]}
 */
export const certifications = storedCertifications
  .map((stored) => resolveCertification(stored, getOrganization))
  .sort((a, b) => recency(b).localeCompare(recency(a)));

export const CERTIFICATION_KINDS = [
  { id: "certification", label: "Certifications" },
  { id: "course", label: "Courses" },
];

export const CERTIFICATION_CATEGORIES = [
  { id: "professional", label: "Professional" },
  { id: "leadership-community", label: "Leadership & community" },
];

/**
 * Certifications and courses apart, each grouped by category, keeping
 * the list's order inside a group. Empty kinds and groups are left out.
 * @param {Certification[]} items
 */
export function groupCertifications(items) {
  return CERTIFICATION_KINDS.map((kind) => ({
    ...kind,
    groups: CERTIFICATION_CATEGORIES.map((category) => ({
      ...category,
      items: items.filter(
        (item) => item.kind === kind.id && item.category === category.id,
      ),
    })).filter((group) => group.items.length > 0),
  })).filter((kind) => kind.groups.length > 0);
}

/** @param {string} id */
export function getCertification(id) {
  return certifications.find((item) => item.id === id);
}
