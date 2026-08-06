import { cn } from "../../lib/cn";

/**
 * Small status/metadata pill — used for stack names, status labels, and
 * category chips. Not a button; purely informational.
 * @param {{ children: import("react").ReactNode, className?: string }} props
 */
export function Tag({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) px-3 py-1 font-mono text-xs text-(--color-text-secondary)",
        className,
      )}
    >
      {children}
    </span>
  );
}
