import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation, useOutlet } from "react-router-dom";
import { pageTransitionVariants } from "./motion-variants";
import { useIsViewTransitioning } from "./route-transition";
import { RouteScrollReset, useRememberScroll } from "./route-scroll";

/**
 * Replaces a bare <Outlet /> to add a short cross-fade between routes.
 * Uses `useOutlet` (not `<Outlet />` directly) so the previous route's
 * element can be kept mounted during its exit animation. Under reduced
 * motion, MotionProvider's `reducedMotion="user"` collapses this to an
 * effectively instant change.
 *
 * During a route view transition the browser animates the change, so
 * the fade is skipped: the motion key stays the same and the new page
 * replaces the old one at once (the inner key still remounts it).
 */
export function PageTransition() {
  const location = useLocation();
  const element = useOutlet();
  const transitioning = useIsViewTransitioning();
  const [shownPath, setShownPath] = useState(location.pathname);
  const [fadeKey, setFadeKey] = useState(0);
  const [navigated, setNavigated] = useState(false);
  useRememberScroll();

  if (location.pathname !== shownPath) {
    setShownPath(location.pathname);
    setNavigated(true);
    if (!transitioning) setFadeKey((key) => key + 1);
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={fadeKey}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Fragment key={location.pathname}>
          <RouteScrollReset initial={!navigated} />
          {element}
        </Fragment>
      </motion.div>
    </AnimatePresence>
  );
}
