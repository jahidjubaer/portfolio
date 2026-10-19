import { certifications as storedCertifications } from "../generated/content.json";

/**
 * Certificates and training, grouped by kind, edited in the admin panel
 * and read from the published content snapshot. Add `credentialUrl` only
 * with a real verification link.
 *
 * @typedef {{
 *   id: string,
 *   title: string,
 *   issuer: string,
 *   category: "professional" | "leadership" | "other",
 *   status: "completed" | "in-progress",
 *   issued?: string,
 *   credentialUrl?: string,
 *   description?: string,
 * }} Certification
 */

/** @type {Certification[]} */
export const certifications = [...storedCertifications].sort(
  (a, b) => a.order - b.order,
);

/** Display order and headings; groups without entries are not shown. */
export const CERTIFICATION_CATEGORIES = [
  { id: "professional", label: "Professional" },
  { id: "leadership", label: "Leadership" },
  { id: "other", label: "Other" },
];
