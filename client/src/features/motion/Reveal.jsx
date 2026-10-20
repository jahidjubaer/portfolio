import { motion } from "motion/react";
import { fadeUpVariants } from "./motion-variants";
import { useSkipEntrance } from "./route-transition";

/**
 * Fades + slightly rises a section into view once, the first time it
 * enters the viewport. Content is present in the DOM (and readable by
 * assistive tech / crawlers) regardless of animation state — this only
 * animates opacity/transform, never `display` or `visibility`.
 * @param {{
 *   children: import("react").ReactNode,
 *   as?: "div" | "section" | "li" | "article",
 *   delay?: number,
 *   className?: string,
 * }} props
 */
export function Reveal({ children, as = "div", delay = 0, className = "" }) {
  const MotionTag = motion[as] ?? motion.div;
  // Prerendered content stays visible, and so does a page arriving by a
  // view transition: the reveal only plays for ordinary client navigation.
  const startVisible = useSkipEntrance();

  return (
    <MotionTag
      className={className}
      variants={fadeUpVariants}
      custom={delay}
      initial={startVisible ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}
