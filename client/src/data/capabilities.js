/**
 * Capability categories, not skill levels or percentages.
 * See CONTENT_CHECKLIST.md section 8.
 * @type {Array<{ id: string, title: string, items: string[] }>}
 */
export const capabilityGroups = [
  {
    id: "frontend",
    title: "Frontend",
    items: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Tailwind CSS",
      "Responsive UI",
    ],
  },
  {
    id: "engineering-foundation",
    title: "Engineering Foundation",
    items: [
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Git and GitHub",
      "REST API concepts",
    ],
  },
  {
    id: "currently-expanding",
    title: "Currently Expanding",
    items: [
      "Node.js",
      "Express.js",
      "Full-stack application architecture",
      "AI-enabled product development",
    ],
  },
];
