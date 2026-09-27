import { cn } from "../../lib/cn";
import { useActiveSection } from "../../hooks/useActiveSection";

const MINIMUM_SECTIONS_FOR_NAV = 4;
const STICKY_OFFSET = 80;

/**
 * Anchor-based case-study section navigation. Only renders once at least
 * four real sections exist. Highlights the section nearest the viewport top.
 * @param {{
 *   sections: import("../../data/projects").CaseStudySectionMeta[],
 *   className?: string,
 * }} props
 */
export function ProjectSectionNav({ sections, className = "" }) {
  const sectionIds = sections?.map((s) => s.id) ?? [];
  const activeId = useActiveSection(sectionIds, STICKY_OFFSET);

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
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-(--color-accent-primary) font-medium"
                    : "text-(--color-text-secondary) hover:text-(--color-accent-primary)",
                )}
              >
                {section.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
