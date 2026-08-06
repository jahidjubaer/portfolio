import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const VARIANT_CLASSES = {
  primary:
    "bg-(--color-accent-primary) text-(--color-on-accent-primary) border border-transparent hover:brightness-110",
  secondary:
    "bg-transparent text-(--color-text-primary) border border-(--color-border) hover:border-(--color-accent-primary) hover:text-(--color-accent-primary)",
  ghost:
    "bg-transparent text-(--color-text-secondary) border border-transparent hover:text-(--color-text-primary) hover:bg-(--color-surface-soft)",
};

/**
 * An icon-only button. `label` is required and becomes the accessible
 * name (aria-label) — there is no visible text fallback, so this must
 * never be omitted.
 * @param {{
 *   label: string,
 *   variant?: "primary" | "secondary" | "ghost",
 *   children: import("react").ReactNode,
 *   className?: string,
 * } & import("react").ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const IconButton = forwardRef(function IconButton(
  { label, variant = "ghost", children, className = "", ...rest },
  ref,
) {
  if (import.meta.env.DEV && !label) {
    console.error("IconButton requires a `label` prop for accessibility.");
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex min-touch-target items-center justify-center rounded-(--radius-md) transition-colors duration-(--duration-quick)",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
});
