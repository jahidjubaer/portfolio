import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getProjectMedia } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectLinks } from "./ProjectLinks";
import { ProjectMetaGrid } from "./ProjectMetaGrid";
import { ProjectPreviewModal } from "./ProjectPreviewModal";

export function FeaturedProjectDossier({
  project,
  index,
  headingLevel = "h3",
  showMeta = false,
  priorityImage = false,
}) {
  const [showPreview, setShowPreview] = useState(false);
  const HeadingTag = headingLevel;
  const detailHref = `/work/${project.slug}`;
  const { cover } = getProjectMedia(project.slug);

  return (
    <>
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
          {showMeta ? (
            <ProjectMetaGrid project={project} className="mt-5" />
          ) : null}
          <ProjectStack stack={project.stack} className="mt-5" />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ProjectLinks links={project.links} />
            <ProjectStatus project={project} />
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 text-xs text-(--color-text-muted) hover:text-(--color-accent-primary) transition-colors"
            >
              <Play size={13} />
              <span>Sandbox</span>
            </button>
          </div>
        </div>
        <div
          onClick={() => setShowPreview(true)}
          className="group relative cursor-pointer aspect-video overflow-hidden rounded-(--radius-md) border border-(--color-border) lg:aspect-square"
        >
          <ImageWithFallback
            src={cover.src}
            fallbackSrc={cover.fallback}
            alt={`${project.title} project cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priorityImage ? "eager" : "lazy"}
            fetchPriority={priorityImage ? "high" : undefined}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full bg-(--color-accent-primary) px-4 py-2 text-xs font-semibold text-(--color-on-accent-primary) shadow-lg">
              Launch Sandbox Preview
            </span>
          </div>
        </div>
      </article>

      {showPreview && (
        <ProjectPreviewModal
          project={project}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
