import { AnimatePresence, motion } from "motion/react";
import { useLocation, useOutlet } from "react-router-dom";
import { pageTransitionVariants } from "./motion-variants";

/**
 * Replaces a bare <Outlet /> to add a short cross-fade between routes.
 * Uses `useOutlet` (not `<Outlet />` directly) so the previous route's
 * element can be kept mounted during its exit animation. Under reduced
 * motion, MotionProvider's `reducedMotion="user"` collapses this to an
 * effectively instant change.
 */
export function PageTransition() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
