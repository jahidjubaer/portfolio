import { SectionLabel } from "../../components/ui/SectionLabel";
import { ProjectStack } from "./ProjectStack";
import { ProjectLinks } from "./ProjectLinks";
import { ProjectMetaGrid } from "./ProjectMetaGrid";

/**
 * Case-study page hero: title, summary, meta, stack, and links.
 * @param {{ project: import("../../data/projects").Project }} props
 */
export function ProjectHero({ project }) {
  return (
    <div>
      <SectionLabel>Case study</SectionLabel>
      <h1 className="heading-xl mt-3 text-(--color-text-primary)">
        {project.title}
      </h1>
      <p className="body-lg mt-4 max-w-prose text-(--color-text-secondary)">
        {project.summary}
      </p>
      <ProjectMetaGrid project={project} className="mt-8" />
      <ProjectStack stack={project.stack} className="mt-6" />
      <ProjectLinks links={project.links} className="mt-6" />
    </div>
  );
}
