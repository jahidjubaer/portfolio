import { ArrowRight } from "lucide-react";
import { ProjectCard } from "../projects/ProjectCard";
import { getFeaturedProjects } from "../projects/project-selectors";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import { TextLink } from "../../components/ui/TextLink";

/** Featured projects as a card grid: the profile's second tab. */
export function WorkTab() {
  const featured = getFeaturedProjects();
  return (
    <div className="px-4 py-7 sm:px-7">
      <h2 className="sr-only">Featured projects</h2>
      <StaggerGroup as="ul" className="grid gap-5 sm:grid-cols-2">
        {featured.map((project, index) => (
          <StaggerItem key={project.slug} as="li">
            <ProjectCard project={project} priorityImage={index === 0} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      <TextLink
        to="/work"
        className="mt-6 inline-flex items-center gap-1.5 font-semibold"
      >
        All projects
        <ArrowRight size={16} aria-hidden="true" />
      </TextLink>
    </div>
  );
}
