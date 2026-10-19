/**
 * Certificates and training, grouped by kind. Every entry is copied from
 * the "Training" section of Jahid's resume PDF (updated September 2026);
 * nothing else is verified yet. No leadership certificates or credential
 * links have been supplied, so none are listed (add `credentialUrl` only
 * with a real verification link).
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
export const certifications = [
  {
    id: "programming-hero-complete-web-development",
    title: "Complete Web Development",
    issuer: "Programming Hero",
    category: "professional",
    status: "completed",
    issued: "2026",
  },
  {
    id: "learn-with-sumit-reactive-accelerator",
    title: "Reactive Accelerator",
    issuer: "Learn with Sumit",
    category: "professional",
    status: "in-progress",
  },
  {
    id: "edge-python-data-science",
    title: "Python Programming & Basic Data Science",
    issuer: "EDGE, IICT SUST",
    category: "professional",
    status: "completed",
    issued: "2024",
  },
  {
    id: "wadhwani-jobready-employability",
    title: "Employability Skills (JobReady)",
    issuer: "Wadhwani Foundation",
    category: "professional",
    status: "completed",
    issued: "2024",
  },
];

/** Display order and headings; groups without entries are not shown. */
export const CERTIFICATION_CATEGORIES = [
  { id: "professional", label: "Professional" },
  { id: "leadership", label: "Leadership" },
  { id: "other", label: "Other" },
];
