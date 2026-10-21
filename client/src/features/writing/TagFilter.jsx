import { cn } from "../../lib/cn";
import { detectTextLanguage } from "../../lib/language";

/**
 * Tag chips for a post list. "All" clears the filter.
 * @param {{
 *   tags: string[],
 *   selected: string,
 *   onSelect: (tag: string) => void,
 *   label?: string,
 *   className?: string,
 * }} props
 */
export function TagFilter({
  tags,
  selected,
  onSelect,
  label = "Filter by tag",
  className,
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {["All", ...tags].map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={selected === tag}
          onClick={() => onSelect(tag)}
          lang={detectTextLanguage(tag)}
          className={cn(
            "min-touch-target rounded-(--radius-pill) border px-4 py-2 text-sm transition-colors",
            selected === tag
              ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) font-semibold text-(--color-accent-primary)"
              : "border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary)",
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
