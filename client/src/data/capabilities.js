/**
 * Capability categories, not skill levels or percentages.
 * See CONTENT_CHECKLIST.md section 8. Grouped by honesty, not aspiration:
 * "Current strengths" is used in production today, "Engineering foundations"
 * underpins it, "Currently expanding" is being learned and must never be
 * presented as expert-level.
 * @type {Array<{ id: string, title: string, items: string[] }>}
 */
export const capabilityGroups = [
  {
    id: "current-strengths",
    title: "Current strengths",
    items: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Tailwind CSS",
      "Responsive UI",
      "Git and GitHub",
    ],
  },
  {
    id: "engineering-foundations",
    title: "Engineering foundations",
    items: [
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "REST API concepts",
      "Problem solving",
    ],
  },
  {
    id: "currently-expanding",
    title: "Currently expanding",
    items: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "Full-stack application architecture",
      "AI-enabled product development",
    ],
  },
];
