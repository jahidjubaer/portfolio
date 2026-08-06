import { cn } from "../../lib/cn";

const MINIMUM_SECTIONS_FOR_NAV = 4;

/**
 * Anchor-based case-study section navigation. Only renders once at least
 * four real sections exist (CLAUDE.md: no navigation for its own sake).
 * Uses plain anchor links and native browser scrolling — no smooth-scroll
 * library, no active-section tracking.
 * @param {{
 *   sections: import("../../data/projects").CaseStudySectionMeta[],
 *   className?: string,
 * }} props
 */
export function ProjectSectionNav({ sections, className = "" }) {
  if (!sections || sections.length < MINIMUM_SECTIONS_FOR_NAV) return null;

  return (
    <nav
      aria-label="Case study sections"
      className={cn(
        "sticky top-(--header-height) z-30 -mx-4 overflow-x-auto border-b border-(--color-border) bg-(--color-canvas) px-4 py-3",
        className,
      )}
    >
      <ul className="flex gap-5 whitespace-nowrap text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-(--color-text-secondary) hover:text-(--color-accent-primary) focus-visible:text-(--color-accent-primary)"
            >
              {section.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
