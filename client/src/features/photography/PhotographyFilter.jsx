import { cn } from "../../lib/cn";
import { PHOTOGRAPHY_CATEGORY_LABELS } from "../../data/photography";

/**
 * Category filter chips. Active state is never color-only — it also
 * carries `aria-pressed`, a heavier weight, and an underline.
 * @param {{
 *   categories: string[],
 *   activeCategory: string,
 *   onChange: (category: string) => void,
 * }} props
 */
export function PhotographyFilter({ categories, activeCategory, onChange }) {
  const options = ["all", ...categories];

  return (
    <div
      role="group"
      aria-label="Filter photography by category"
      className="flex flex-wrap gap-2"
    >
      {options.map((category) => {
        const isActive = activeCategory === category;
        const label =
          category === "all"
            ? "All"
            : (PHOTOGRAPHY_CATEGORY_LABELS[category] ?? category);

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(category)}
            className={cn(
              "min-touch-target rounded-(--radius-pill) border px-4 py-2 text-sm transition-colors",
              isActive
                ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) font-semibold text-(--color-text-primary) underline underline-offset-4"
                : "border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary)",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
