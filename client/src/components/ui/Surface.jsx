import { cn } from "../../lib/cn";

const VARIANT_CLASSES = {
  default: "bg-(--color-canvas) border border-(--color-border)",
  raised: "bg-(--color-surface-raised) border border-(--color-border)",
  accent:
    "bg-(--color-accent-primary-soft) border border-(--color-accent-primary)/30",
  // Uses the same token names as the other variants — the values themselves
  // shift automatically under data-identity="story" (see tokens.css), so
  // this variant just documents intent: "this surface belongs to a STORY
  // section."
  story: "bg-(--color-surface) border border-(--color-border)",
};

/**
 * Generic panel surface. Not every section needs to be a Surface — use it
 * only where a real visual boundary (a technical panel, a dossier, a
 * status block) is intended, not as a default wrapper for everything.
 * @param {{
 *   variant?: "default" | "raised" | "accent" | "story",
 *   as?: keyof JSX.IntrinsicElements,
 *   children: import("react").ReactNode,
 *   className?: string,
 * }} props
 */
export function Surface({
  variant = "default",
  as: Tag = "div",
  children,
  className = "",
  ...rest
}) {
  return (
    <Tag
      className={cn(
        "rounded-(--radius-lg)",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
