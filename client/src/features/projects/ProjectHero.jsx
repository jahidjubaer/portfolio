import { SectionLabel } from "../../components/ui/SectionLabel";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getProjectCover } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";
import { ProjectLinks } from "./ProjectLinks";
import { STATUS_META } from "./project-status-meta";
import { estimateReadTime } from "../../lib/readTime";
import {
  projectCoverTransition,
  useIsViewTransitioningPath,
} from "../motion/route-transition";

/**
 * The project's facts as one viewfinder-style readout line: role,
 * timeline, status, type, and reading time. Only facts that are entered
 * appear; it wraps on narrow screens.
 * @param {{ project: import("../../data/projects").Project }} props
 */
function SpecStrip({ project }) {
  const readTime = project.caseStudy
    ? estimateReadTime(project.caseStudy)
    : null;
  const items = [
    { label: "Role", value: project.caseStudy?.role },
    { label: "Timeline", value: project.caseStudy?.timeline },
    { label: "Status", value: STATUS_META[project.status]?.label },
    { label: "Type", value: project.projectType },
    { label: "Read", value: readTime ? `~${readTime} min` : null },
  ].filter((item) => item.value);

  return (
    <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-(--color-border) py-3 font-mono text-[0.8125rem]">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="text-[0.6875rem] tracking-[0.12em] text-(--color-text-muted) uppercase">
            {item.label}
          </dt>
          <dd className="text-(--color-text-primary)">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Case-study page hero: title, summary, the spec strip, stack, links, and
 * the project's one picture as a framed print.
 * @param {{ project: import("../../data/projects").Project }} props
 */
export function ProjectHero({ project }) {
  const cover = getProjectCover(project);
  const morphing = useIsViewTransitioningPath(`/work/${project.slug}`);

  return (
    <div>
      <SectionLabel>Case study</SectionLabel>
      <h1 className="heading-xl mt-3 text-(--color-text-primary)">
        {project.title}
      </h1>
      <p className="body-lg mt-4 max-w-prose text-(--color-text-secondary)">
        {project.summary}
      </p>
      <SpecStrip project={project} />
      <ProjectStack stack={project.stack} className="mt-5" />
      <ProjectLinks links={project.links} className="mt-5" />

      <figure className="has-brackets mt-8 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-raised) p-2 sm:p-2.5">
        <FocusBrackets locked />
        <div
          className="aspect-video overflow-hidden rounded-(--radius-md)"
          style={projectCoverTransition(project.slug, morphing)}
        >
          <ImageWithFallback
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(min-width: 1024px) 760px, 100vw"
            fallbackSrc={cover.fallback}
            alt={cover.alt}
            width={cover.width}
            height={cover.height}
            className="h-full w-full object-cover object-top"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </figure>
    </div>
  );
}
