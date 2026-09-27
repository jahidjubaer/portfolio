/**
 * Capability categories, not skill levels or percentages.
 * See CONTENT_CHECKLIST.md section 8. Grouped by honesty, not aspiration:
 * "Current strengths" is used in production today, "Engineering foundations"
 * underpins it, "Currently expanding" is being learned and must never be
 * presented as expert-level.
 * @type {Array<{ id: string, title: string, description: string, accent: "primary" | "secondary" | "muted", items: string[] }>}
 */
export const capabilityGroups = [
  {
    id: "current-strengths",
    title: "Current strengths",
    description: "Technologies and tools I build with today.",
    accent: "primary",
    items: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Tailwind CSS",
      "Responsive UI",
      "Git & GitHub",
    ],
  },
  {
    id: "engineering-foundations",
    title: "Engineering foundations",
    description: "Core CS fundamentals that underpin every system I build.",
    accent: "secondary",
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
    description: "Areas I'm actively learning — not expert-level yet.",
    accent: "muted",
    items: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "Full-stack architecture",
      "AI-enabled products",
    ],
  },
];
