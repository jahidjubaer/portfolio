import { cn } from "../../lib/cn";

const TONE_CLASSES = {
  positive: "bg-(--color-success)",
  neutral: "bg-(--color-accent-secondary)",
  warning: "bg-(--color-warning)",
};

/**
 * A status dot plus label. The label always carries the meaning — color
 * is a supplement, never the only signal (see CLAUDE.md accessibility
 * rules: "non-color-only status meaning").
 * @param {{
 *   tone?: "positive" | "neutral" | "warning",
 *   children: import("react").ReactNode,
 *   className?: string,
 * }} props
 */
export function StatusIndicator({
  tone = "positive",
  children,
  className = "",
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs text-(--color-text-secondary)",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-2 w-2 rounded-full", TONE_CLASSES[tone])}
      />
      {children}
    </span>
  );
}
