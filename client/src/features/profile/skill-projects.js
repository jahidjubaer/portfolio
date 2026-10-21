/**
 * Comparable form of a technology name, so a skill matches the same tool
 * in a project's stack however it is written ("Express.js" / "Express",
 * "Tailwind CSS" / "tailwindcss").
 * @param {string} name
 */
export function normalizeTech(name) {
  return name
    .toLowerCase()
    .replace(/\.js$/, "")
    .replace(/[^a-z0-9+#]/g, "");
}

/**
 * Public projects whose stack lists `skill`, in their display order.
 * @param {string} skill
 * @param {Array<{ slug: string, title: string, stack: string[] }>} projects
 */
export function projectsUsing(skill, projects) {
  const key = normalizeTech(skill);
  return projects
    .filter((project) =>
      project.stack.some((tech) => normalizeTech(tech) === key),
    )
    .map(({ slug, title }) => ({ slug, title }));
}
