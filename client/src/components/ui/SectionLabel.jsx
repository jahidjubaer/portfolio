import { cn } from "../../lib/cn";

/**
 * @param {{ children: import("react").ReactNode, className?: string }} props
 */
export function SectionLabel({ children, className = "" }) {
  return (
    <p className={cn("eyebrow text-(--color-accent-primary)", className)}>
      {children}
    </p>
  );
}
