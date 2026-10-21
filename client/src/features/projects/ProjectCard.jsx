import { Link } from "react-router-dom";
import { BookOpen, Globe, Lock } from "lucide-react";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { GitHubIcon } from "../../components/icons/BrandIcons";
import { getProjectCover } from "../../lib/project-assets";
import { cn } from "../../lib/cn";
import { formatRelativeDate } from "../../lib/relativeTime";
import { useNow } from "../../lib/hydration";
import {
  projectCoverTransition,
  useIsViewTransitioningPath,
} from "../motion/route-transition";
import {
  getProjectLinks,
  getProjectLiveUrl,
  getProjectMonogram,
  getProjectRepo,
  hasCompleteCaseStudy,
} from "./project-selectors";

const MAX_TAGS = 4;

/** @param {{ project: import("../../data/projects").Project }} props */
function ProjectFlag({ project }) {
  const base =
    "absolute left-3 top-3 z-[1] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[0.8125rem] font-semibold text-white backdrop-blur-sm";
  if (hasCompleteCaseStudy(project)) {
    return (
      <span className={base}>
        <BookOpen size={13} aria-hidden="true" className="text-[#bef264]" />
        Full case study
      </span>
    );
  }
  if (project.status === "live") {
    return (
      <span className={base}>
        <span className="status-dot" aria-hidden="true" />
        Live
      </span>
    );
  }
  return null;
}

/**
 * Project card for grids (profile Work tab, Projects page, related
 * projects). The title link is stretched over the whole card; repository
 * links sit above it so they stay independently clickable.
 * @param {{
 *   project: import("../../data/projects").Project,
 *   headingLevel?: "h2" | "h3",
 *   priorityImage?: boolean,
 *   className?: string,
 * }} props
 */
export function ProjectCard({
  project,
  headingLevel = "h3",
  priorityImage = false,
  className = "",
}) {
  const HeadingTag = headingLevel;
  const cover = getProjectCover(project);
  const repositories = getProjectLinks(project, "repository");
  const repo = getProjectRepo(project);
  const liveUrl = getProjectLiveUrl(project);
  const now = useNow();
  const href = `/work/${project.slug}`;
  const morphing = useIsViewTransitioningPath(href);

  return (
    <article
      className={cn(
        "has-brackets group flex h-full flex-col rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-1.5",
        className,
      )}
    >
      <FocusBrackets />
      <div
        className="project-media-gradient relative h-48 overflow-hidden rounded-[1.0625rem] sm:h-52"
        style={projectCoverTransition(project.slug, morphing)}
      >
        <ProjectFlag project={project} />
        {cover.available ? (
          <ImageWithFallback
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(min-width: 640px) 400px, 100vw"
            fallbackSrc={cover.fallback}
            alt={cover.alt}
            className="h-full w-full object-cover object-top transition-transform duration-(--duration-slow) ease-(--ease-standard) motion-safe:group-hover:scale-[1.03]"
            loading={priorityImage ? "eager" : "lazy"}
            fetchPriority={priorityImage ? "high" : undefined}
          />
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1.2px)] bg-size-[14px_14px]">
            <span
              aria-hidden="true"
              className="grid h-22 min-w-23 place-items-center rounded-[1.25rem] border border-white/20 bg-white/10 px-5 text-3xl font-bold tracking-[-0.03em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-transform duration-(--duration-slow) ease-(--ease-standard) motion-safe:group-hover:-translate-y-1"
            >
              {getProjectMonogram(project.title)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3 pt-4">
        <HeadingTag className="text-lg font-semibold tracking-[-0.01em] text-(--color-text-primary)">
          <Link
            to={href}
            viewTransition
            className="outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:underline"
          >
            {project.title}
          </Link>
        </HeadingTag>
        <p className="line-clamp-3 text-[0.9375rem] text-(--color-text-secondary)">
          {project.summary}
        </p>
        {repo ? (
          <p className="text-[0.8125rem] text-(--color-text-muted)">
            {[
              repo.language,
              `Updated ${formatRelativeDate(repo.pushedAt, now)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.stack.slice(0, MAX_TAGS).map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-(--color-border) bg-(--color-surface-raised) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)"
              >
                {tech}
              </li>
            ))}
          </ul>
          {repositories.length > 0 || liveUrl ? (
            <div className="relative z-[1] flex shrink-0 items-center gap-1">
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title} live site`}
                  title="Live site"
                  className="grid size-11 place-items-center rounded-full text-(--color-text-muted) transition-colors hover:bg-(--color-surface-soft) hover:text-(--color-text-primary)"
                >
                  <Globe size={17} />
                </a>
              ) : null}
              {repositories.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title} ${link.label.toLowerCase()} on GitHub`}
                  title={link.label}
                  className="grid size-11 place-items-center rounded-full text-(--color-text-muted) transition-colors hover:bg-(--color-surface-soft) hover:text-(--color-text-primary)"
                >
                  <GitHubIcon size={17} />
                </a>
              ))}
            </div>
          ) : null}
          {project.status === "private" ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] text-(--color-text-muted)">
              <Lock size={14} aria-hidden="true" />
              Private
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
