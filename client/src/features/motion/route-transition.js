import { useContext } from "react";
import { UNSAFE_ViewTransitionContext } from "react-router-dom";
import { useIsHydrating } from "../../lib/hydration";

/*
 * React Router runs a view transition for <Link viewTransition>
 * navigations and for Back/Forward over one. The browser animates that
 * page change itself, so the Motion route fade steps aside and entrance
 * animations start visible (otherwise the browser would capture the new
 * page while it is still transparent).
 *
 * The context is read directly rather than through useViewTransitionState,
 * which throws outside a data router (component tests render without one).
 */
function useViewTransitionContext() {
  return useContext(UNSAFE_ViewTransitionContext);
}

/** True while a route view transition is running. */
export function useIsViewTransitioning() {
  return useViewTransitionContext()?.isTransitioning === true;
}

/** True while a view transition runs to or from `pathname`. */
export function useIsViewTransitioningPath(pathname) {
  const context = useViewTransitionContext();
  if (!context?.isTransitioning) return false;
  return (
    context.currentLocation?.pathname === pathname ||
    context.nextLocation?.pathname === pathname
  );
}

/**
 * True when Reveal/StaggerGroup should render in their final state:
 * while hydrating prerendered HTML, and during a route view transition.
 */
export function useSkipEntrance() {
  const hydrating = useIsHydrating();
  const transitioning = useIsViewTransitioning();
  return hydrating || transitioning;
}

/**
 * Shared-element style for a project's cover: the card on the Work page
 * and the case-study hero use the same name, so the browser morphs one
 * into the other. Only set while that project's page is transitioning,
 * because a name must be unique on the page.
 * @param {string} slug
 * @param {boolean} active
 */
export function projectCoverTransition(slug, active) {
  if (!active) return undefined;
  return {
    viewTransitionName: `project-cover-${slug.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    viewTransitionClass: "project-cover",
  };
}
