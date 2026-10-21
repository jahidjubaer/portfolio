import { cn } from "../../lib/cn";

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "text"];
export const BUTTON_SIZES = ["sm", "md", "lg"];

const VARIANT_CLASSES = {
  // Lit-from-inside fill: gradient + top highlight + accent edge + soft glow.
  primary:
    "bg-linear-to-b from-(--color-accent-fill-from) to-(--color-accent-fill-to) text-(--color-on-accent-primary) border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_var(--color-accent-edge),0_8px_24px_-8px_var(--color-accent-glow)] hover:brightness-105",
  secondary:
    "bg-(--color-surface-raised) text-(--color-text-primary) border border-(--color-border-strong) hover:border-(--color-text-muted)",
  ghost:
    "bg-transparent text-(--color-text-secondary) border border-transparent hover:text-(--color-text-primary) hover:bg-(--color-surface-soft)",
  text: "bg-transparent text-(--color-accent-primary) border border-transparent px-0 hover:underline underline-offset-4",
};

const SIZE_CLASSES = {
  sm: "min-h-10 px-3.5 py-1.5 text-sm gap-1.5",
  md: "min-h-11 px-4.5 py-2.5 text-[0.9375rem] gap-2",
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
    "inline-flex items-center justify-center rounded-(--radius-md) font-semibold transition-[color,background-color,border-color,filter,transform] duration-(--duration-quick) min-touch-target motion-safe:active:scale-[0.97]",
    variant !== "text" && SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    disabled && "cursor-not-allowed opacity-50",
    className,
  );
}
