import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getProjectMedia } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectLinks } from "./ProjectLinks";

/**
 * Larger, numbered project presentation used for the homepage's headline
 * featured project.
 * @param {{
 *   project: import("../../data/projects").Project,
 *   index: number,
 *   headingLevel?: "h2" | "h3",
 * }} props
 */
export function FeaturedProjectDossier({
  project,
  index,
  headingLevel = "h3",
}) {
  const HeadingTag = headingLevel;
  const detailHref = `/work/${project.slug}`;
  const { cover } = getProjectMedia(project.slug);

  return (
    <article className="grid gap-8 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-8 lg:grid-cols-[auto_1fr_0.9fr] lg:items-start lg:gap-10 lg:p-10">
      <span
        className="mono-meta text-(--color-accent-primary)"
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <HeadingTag className="heading-lg text-(--color-text-primary)">
          <Link
            to={detailHref}
            className="hover:underline focus-visible:underline"
          >
            {project.title}
          </Link>
        </HeadingTag>
        <p className="body-md mt-3 text-(--color-text-secondary)">
          {project.summary}
        </p>
        <ProjectStack stack={project.stack} className="mt-5" />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ProjectStatus project={project} />
          <ProjectLinks links={project.links} />
        </div>
      </div>
      <div className="aspect-video overflow-hidden rounded-(--radius-md) border border-(--color-border) lg:aspect-square">
        <ImageWithFallback
          src={cover.src}
          fallbackSrc={cover.fallback}
          alt={`${project.title} project cover`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </article>
  );
}
