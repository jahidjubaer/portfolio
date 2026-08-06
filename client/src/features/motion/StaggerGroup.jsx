import { motion } from "motion/react";
import { fadeUpVariants, staggerContainerVariants } from "./motion-variants";

/**
 * Wraps a list of children (e.g. project dossiers, capability groups) so
 * they reveal in sequence rather than all at once. Each direct child
 * should be wrapped in <StaggerItem> or spread `variants={fadeUpVariants}`
 * manually — StaggerGroup only orchestrates timing via the parent
 * variants' `staggerChildren`.
 * @param {{
 *   children: import("react").ReactNode,
 *   as?: "div" | "ul" | "ol",
 *   staggerDelay?: number,
 *   className?: string,
 * }} props
 */
export function StaggerGroup({
  children,
  as = "div",
  staggerDelay = 0.06,
  className = "",
}) {
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={staggerContainerVariants(staggerDelay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * A single item inside a StaggerGroup. Must be a direct child so it
 * inherits the "visible" trigger from the parent's variants.
 * @param {{
 *   children: import("react").ReactNode,
 *   as?: "div" | "li" | "article",
 *   className?: string,
 * }} props
 */
export function StaggerItem({ children, as = "div", className = "" }) {
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag className={className} variants={fadeUpVariants}>
      {children}
    </MotionTag>
  );
}
