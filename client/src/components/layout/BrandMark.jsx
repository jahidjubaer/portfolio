import { cn } from "../../lib/cn";

/** The lit "J" tile used as the site mark. Decorative — callers label it. */
export function BrandMark({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid size-10 shrink-0 place-items-center rounded-[0.7rem] bg-linear-to-b from-(--color-accent-fill-from) to-(--color-accent-fill-to) text-lg font-bold text-(--color-on-accent-primary) shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_0_0_1px_var(--color-accent-edge),0_6px_18px_-6px_var(--color-accent-glow)]",
        className,
      )}
    >
      J
    </span>
  );
}
