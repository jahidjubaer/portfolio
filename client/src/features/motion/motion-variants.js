import { DURATIONS, EASE_STANDARD } from "./motion-config";

/**
 * Fade + small rise. Used by Reveal and the hero entrance. Respects
 * reduced motion by shrinking to a pure opacity change — MotionConfig's
 * `reducedMotion="user"` (set in MotionProvider) automatically strips the
 * transform on top of this, but the variant is written so it also
 * degrades gracefully if read directly.
 */
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  // Function form so an individual instance can pass an extra delay via
  // the `custom` prop (see Reveal) without needing a bespoke variants
  // object per usage.
  visible: (customDelay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.standard,
      ease: EASE_STANDARD,
      delay: customDelay,
    },
  }),
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATIONS.quick, ease: EASE_STANDARD },
  },
};

/**
 * Container variant for StaggerGroup — children should use fadeUpVariants.
 */
export function staggerContainerVariants(staggerDelay = 0.06) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
}

export const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATIONS.quick, ease: EASE_STANDARD },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATIONS.quick, ease: EASE_STANDARD },
  },
};

export const mobileMenuVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.quick, ease: EASE_STANDARD },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATIONS.quick, ease: EASE_STANDARD },
  },
};
