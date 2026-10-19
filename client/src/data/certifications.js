import { certifications as storedCertifications } from "../generated/content.json";
import { getOrganization } from "./organizations";

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   organization: import("./organizations").Organization,
 *   kind: "certification" | "course",
 *   status: "completed" | "in-progress",
 *   issued?: string,
 *   expires?: string,
 *   credentialId?: string,
 *   credentialUrl?: string,
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
  return { ...item, organization: findOrganization(organizationId) };
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

/** @param {string} id */
export function getCertification(id) {
  return certifications.find((item) => item.id === id);
}
