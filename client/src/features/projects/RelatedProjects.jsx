import { ProjectCard } from "./ProjectCard";

/**
 * @param {{ projects: import("../../data/projects").Project[] }} props
 */
export function RelatedProjects({ projects }) {
  if (!projects || projects.length === 0) return null;

  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard project={project} headingLevel="h3" />
        </li>
      ))}
    </ul>
  );
}
