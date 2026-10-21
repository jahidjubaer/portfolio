import { SectionLabel } from "../../components/ui/SectionLabel";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getProjectMedia } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";
import { ProjectLinks } from "./ProjectLinks";
import { ProjectMetaGrid } from "./ProjectMetaGrid";
import { estimateReadTime } from "../../lib/readTime";
import {
  projectCoverTransition,
  useIsViewTransitioningPath,
} from "../motion/route-transition";

/**
 * Case-study page hero: title, summary, meta, stack, links, and cover.
 * On desktop, the cover image sits beside the text content.
 * @param {{ project: import("../../data/projects").Project }} props
 */
export function ProjectHero({ project }) {
  const { cover } = getProjectMedia(project.slug);
  const morphing = useIsViewTransitioningPath(`/work/${project.slug}`);
  const readTime = project.caseStudy
    ? estimateReadTime(project.caseStudy)
    : null;

  return (
    <div>
      <SectionLabel>Case study</SectionLabel>
      <div className="lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:items-start">
        <div>
          <h1 className="heading-xl mt-3 text-(--color-text-primary)">
            {project.title}
          </h1>
          <p className="body-lg mt-4 max-w-prose text-(--color-text-secondary)">
            {project.summary}
          </p>
          {readTime ? (
            <p className="mono-meta mt-3 text-(--color-text-muted)">
              ~{readTime} min read
            </p>
          ) : null}
        </div>
        <div
          className="mt-6 lg:mt-0 aspect-video overflow-hidden rounded-(--radius-lg) border border-(--color-border)"
          style={projectCoverTransition(project.slug, morphing)}
        >
          <ImageWithFallback
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(min-width: 1024px) 600px, 100vw"
            fallbackSrc={cover.fallback}
            alt={`${project.title} project cover`}
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
      <ProjectMetaGrid project={project} className="mt-8" />
      <ProjectStack stack={project.stack} className="mt-6" />
      <ProjectLinks links={project.links} className="mt-6" />
    </div>
  );
}
