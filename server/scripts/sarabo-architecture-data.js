/**
 * Sarabo's architecture diagram, added by sarabo-architecture.js. Every
 * step was checked against the Sarabo code (2026-10-21):
 * sarabo-client/src/contexts/AuthContext (Firebase sign-in, ID token),
 * sarabo-client/src/api/payments.js (token on API calls; redirect to
 * Stripe Checkout), sarabo-server/middleware/auth.js (verifyIdToken via
 * firebase-admin), sarabo-server/config/database.js (MongoDB), and
 * sarabo-server/controllers/paymentController.js (Checkout sessions and
 * the Stripe webhook).
 */

const SECTION_ID = "architecture";

export const SARABO_ARCHITECTURE = {
  nodes: [
    { id: "client", label: "React client", column: 1, row: 2 },
    { id: "firebase", label: "Firebase Auth", column: 2, row: 1 },
    { id: "api", label: "Express API", column: 2, row: 2 },
    { id: "mongodb", label: "MongoDB", column: 3, row: 2 },
    { id: "stripe", label: "Stripe", column: 2, row: 3 },
  ],
  steps: [
    {
      from: "client",
      to: "firebase",
      label: "The user signs in with Firebase, which returns an ID token.",
    },
    {
      from: "client",
      to: "api",
      label: "Each API request carries that token.",
    },
    {
      from: "api",
      to: "firebase",
      label: "The API verifies the token with Firebase Admin before it acts.",
    },
    {
      from: "api",
      to: "mongodb",
      label: "Repair requests, quotations, roles, and reviews are stored.",
    },
    {
      from: "api",
      to: "stripe",
      label:
        "For an approved quote, the API creates a Stripe Checkout session; the amount comes from the stored quote, never the browser.",
    },
    {
      from: "client",
      to: "stripe",
      label: "The browser goes to Stripe's hosted checkout to pay.",
    },
    {
      from: "stripe",
      to: "api",
      label: "Stripe's webhook tells the API the payment went through.",
    },
  ],
};

/**
 * Sarabo with its Architecture section turned into a diagram section.
 * @param {Record<string, any>} project
 */
export function withArchitecture(project) {
  return {
    ...project,
    caseStudy: {
      ...project.caseStudy,
      sections: project.caseStudy.sections.map((section) =>
        section.id === SECTION_ID ? { ...section, type: "diagram" } : section,
      ),
      architecture: SARABO_ARCHITECTURE,
    },
  };
}
