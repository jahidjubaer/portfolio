import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllProjects, hasCompleteCaseStudy } from "./project-selectors";

/**
 * Find the next and previous projects relative to the current slug,
 * based on the canonical order in projects.js.
 */
function getAdjacentProjects(slug) {
  const all = getAllProjects();
  const currentIndex = all.findIndex((p) => p.slug === slug);

  if (currentIndex === -1) return { previous: null, next: null };

  const previous = currentIndex > 0 ? all[currentIndex - 1] : null;
  const next = currentIndex < all.length - 1 ? all[currentIndex + 1] : null;

  return { previous, next };
}

function PagerItem({ project, direction }) {
  const isNext = direction === "next";
  const ctaLabel = hasCompleteCaseStudy(project)
    ? "View case study"
    : "View project";

  return (
    <Link
      to={`/work/${project.slug}`}
      className={`group flex flex-col gap-1 rounded-(--radius-md) border border-(--color-border) p-4 transition-colors hover:border-(--color-accent-primary) hover:bg-(--color-surface-soft) ${
        isNext ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <span className="mono-meta flex items-center gap-1 text-(--color-text-muted)">
        {isNext ? (
          <>
            Next
            <ChevronRight size={12} />
          </>
        ) : (
          <>
            <ChevronLeft size={12} />
            Previous
          </>
        )}
      </span>
      <span className="text-sm font-medium text-(--color-text-primary) group-hover:text-(--color-accent-primary)">
        {project.title}
      </span>
      <span className="text-xs text-(--color-text-secondary)">{ctaLabel}</span>
    </Link>
  );
}

/**
 * Next/Previous project navigation for case study pages.
 * @param {{ slug: string }} props
 */
export function CaseStudyPager({ slug }) {
  const { previous, next } = getAdjacentProjects(slug);

  if (!previous && !next) return null;

  return (
    <nav aria-label="Adjacent projects" className="mt-12">
      <div className="grid gap-4 sm:grid-cols-2">
        {previous ? (
          <PagerItem project={previous} direction="previous" />
        ) : (
          <div />
        )}
        {next ? <PagerItem project={next} direction="next" /> : <div />}
      </div>
    </nav>
  );
}
