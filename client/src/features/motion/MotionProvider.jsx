import { MotionConfig } from "motion/react";

/**
 * Global Motion configuration. `reducedMotion="user"` makes every Motion
 * animation in the tree automatically honor the OS-level
 * prefers-reduced-motion setting (transforms are stripped, durations
 * collapse) without each component re-implementing the check.
 * @param {{ children: import("react").ReactNode }} props
 */
export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
