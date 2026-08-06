import { cn } from "../../lib/cn";

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "text"];
export const BUTTON_SIZES = ["sm", "md", "lg"];

const VARIANT_CLASSES = {
  primary:
    "bg-(--color-accent-primary) text-(--color-on-accent-primary) border border-transparent hover:brightness-110 active:brightness-95",
  secondary:
    "bg-transparent text-(--color-text-primary) border border-(--color-border) hover:border-(--color-accent-primary) hover:text-(--color-accent-primary) active:bg-(--color-accent-primary-soft)",
  ghost:
    "bg-transparent text-(--color-text-secondary) border border-transparent hover:text-(--color-text-primary) hover:bg-(--color-surface-soft)",
  text: "bg-transparent text-(--color-accent-primary) border border-transparent px-0 hover:underline underline-offset-4",
};

const SIZE_CLASSES = {
  sm: "min-h-9 px-4 py-1.5 text-sm gap-1.5",
  md: "min-h-11 px-6 py-2.5 text-sm gap-2",
  lg: "min-h-12 px-7 py-3 text-base gap-2.5",
};

/**
 * Shared class-name builder for Button and ButtonLink, so the two
 * components never drift out of sync visually.
 * @param {{ variant?: "primary"|"secondary"|"ghost"|"text", size?: "sm"|"md"|"lg", disabled?: boolean, className?: string }} options
 */
export function getButtonClasses({
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-(--radius-pill) font-semibold transition-colors duration-(--duration-quick) min-touch-target",
    variant !== "text" && SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    disabled && "cursor-not-allowed opacity-50",
    className,
  );
}
