import { Link } from "react-router-dom";
import { Surface } from "../../components/ui/Surface";
import { TextLink } from "../../components/ui/TextLink";
import { cn } from "../../lib/cn";
import { ProjectStack } from "./ProjectStack";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectLinks } from "./ProjectLinks";
import { hasCompleteCaseStudy } from "./project-selectors";

/**
 * Standard project card used in grids (Work index, related projects).
 * @param {{
 *   project: import("../../data/projects").Project,
 *   headingLevel?: "h2" | "h3",
 *   className?: string,
 * }} props
 */
export function ProjectCard({ project, headingLevel = "h3", className = "" }) {
  const HeadingTag = headingLevel;
  const detailHref = `/work/${project.slug}`;
  const ctaLabel = hasCompleteCaseStudy(project)
    ? "View case study"
    : "View project";

  return (
    <Surface as="article" className={cn("flex flex-col p-6", className)}>
      <HeadingTag className="heading-md text-(--color-text-primary)">
        <Link
          to={detailHref}
          className="hover:underline focus-visible:underline"
        >
          {project.title}
        </Link>
      </HeadingTag>
      <p className="body-sm mt-2 flex-1 text-(--color-text-secondary)">
        {project.summary}
      </p>
      <ProjectStack stack={project.stack} className="mt-4" />
      <ProjectStatus project={project} className="mt-4" />
      <ProjectLinks links={project.links} className="mt-4" />
      <div className="mt-4">
        <TextLink to={detailHref}>
          {ctaLabel} for {project.title}
        </TextLink>
      </div>
    </Surface>
  );
}
