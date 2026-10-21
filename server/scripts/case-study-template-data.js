/**
 * Sarabo's case study in the five-section template (docs/14, R2). Every
 * sentence restates what the approved sections already said (Overview,
 * Roles, Workflow, Capabilities, Architecture, Implementation approach,
 * Challenge/outcome/reflection); nothing new is claimed. "The hard part"
 * stays blank until Jahid writes how he solved the validation problem, so
 * it isn't shown.
 */
export const SARABO_SECTIONS = [
  {
    id: "problem",
    heading: "Problem",
    type: "text",
    body: "A repair passes through three people: the customer who needs a device fixed, the administrator who assigns the job, and the technician who does it. Sarabo gives each of them their own view of the same repair request, from submission to payment.",
  },
  {
    id: "what-i-built",
    heading: "What I built",
    type: "text",
    body: [
      "- **Three roles** with their own dashboards: customers submit and track repairs, technicians update the repairs assigned to them, administrators manage accounts and assign technicians.",
      "- **A repair-request lifecycle**: service selection, submission, quotation and review, assignment, progress tracking, and payment.",
      "- **Quotations and Stripe payments**: customers review a quotation and pay through Stripe.",
      "- **Authentication and role-based access** with Firebase.",
      "- **Notifications and customer reviews.**",
    ].join("\n"),
  },
  {
    id: "how-it-works",
    heading: "How it works",
    type: "diagram",
    body: "A React client, hosted on Firebase Hosting, talks to a Node.js and Express API that is deployed separately. Firebase handles sign-in; the API keeps repair requests, quotations, roles, and reviews in MongoDB; Stripe processes payment for a quotation.",
  },
  {
    id: "hard-part",
    heading: "The hard part",
    type: "text",
    body: "",
  },
  {
    id: "result",
    heading: "Result and next",
    type: "text",
    body: "A working full-stack platform, live, built solo from the client to the server: role-based workflows, repair tracking, authentication, and Stripe payments. There are no usage numbers to report. Next: refining validation, the main challenge during development, and documenting how it works.",
  },
];

/** The project with galleries removed, and Sarabo in the template. */
export function migrateProject(project) {
  if (!project.caseStudy) return null;
  const { gallery, ...caseStudy } = project.caseStudy;
  let sections = caseStudy.sections.filter(
    (section) => section.type !== "gallery",
  );
  const oldSarabo =
    project.slug === "sarabo" &&
    !sections.some((section) => section.id === "problem");
  // Its missingContent already lists "validation challenge solution",
  // the text "The hard part" is waiting for.
  if (oldSarabo) sections = SARABO_SECTIONS;
  const changed =
    gallery !== undefined ||
    oldSarabo ||
    sections.length !== caseStudy.sections.length;
  if (!changed) return null;
  return {
    ...project,
    caseStudy: { ...caseStudy, sections },
  };
}
