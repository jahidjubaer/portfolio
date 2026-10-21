import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { DURATIONS, EASE_STANDARD } from "../../features/motion/motion-config";

/**
 * The hairline under a frame-numbered heading: a full-width rule with a
 * short accent segment that draws in from the left the first time it
 * scrolls into view. Decoration only; reduced motion shows it drawn.
 * @param {{ className?: string }} props
 */
export function FrameRule({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block h-px bg-(--color-border)", className)}
    >
      <motion.span
        className="absolute inset-y-0 left-0 w-10 origin-left bg-(--color-accent-primary)"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          delay: 0.15,
          duration: DURATIONS.slow,
          ease: EASE_STANDARD,
        }}
      />
    </span>
  );
}
