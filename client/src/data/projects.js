/**
 * Verified project entries — see CONTENT_CHECKLIST.md section 7.
 * Case-study evidence (exact role, timeline, challenges, outcomes,
 * screenshots) is not yet confirmed for any project, so every entry is
 * shown with an honest "in preparation" status rather than a full
 * case study. Do not add fields here that are not backed by the
 * checklist.
 *
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   stack: string[],
 *   statusLabel: string,
 *   liveUrl: string | null,
 *   repoUrl: string | null,
 * }} Project
 * @type {Project[]}
 */
export const projects = [
  {
    slug: "sarabo",
    title: "Sarabo",
    summary:
      "A multi-role electronics-repair service platform that helps customers request repairs and track service progress while technicians and administrators manage the repair lifecycle.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Firebase"],
    statusLabel: "Live — case study in preparation",
    liveUrl: "https://sarabo-jahid.web.app",
    repoUrl: null,
  },
  {
    slug: "bang-learner",
    title: "Bang Learner",
    summary:
      "A responsive skill-learning platform designed to help users discover suitable courses.",
    stack: ["React", "Tailwind CSS", "MongoDB"],
    statusLabel: "Repository available — case study in preparation",
    liveUrl: null,
    repoUrl: "https://github.com/jahidjubaer/bang-learner",
  },
  {
    slug: "note-bank",
    title: "Note Bank",
    summary:
      "An academic resource platform where students can find notes and previous questions, request missing notes, and access teacher information.",
    stack: ["React", "JavaScript"],
    statusLabel: "Repository available — case study in preparation",
    liveUrl: null,
    repoUrl: "https://github.com/jahidjubaer/note-bank",
  },
];

export function findProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug) ?? null;
}
