import { SectionLabel } from "../../components/ui/SectionLabel";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getProjectMedia } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";
import { ProjectLinks } from "./ProjectLinks";
import { ProjectMetaGrid } from "./ProjectMetaGrid";

/**
 * Case-study page hero: title, summary, meta, stack, links, and cover.
 * @param {{ project: import("../../data/projects").Project }} props
 */
export function ProjectHero({ project }) {
  const { cover } = getProjectMedia(project.slug);

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
      <div className="mt-8 aspect-video overflow-hidden rounded-(--radius-lg) border border-(--color-border)">
        <ImageWithFallback
          src={cover.src}
          fallbackSrc={cover.fallback}
          alt={`${project.title} project cover`}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
    </div>
  );
}
