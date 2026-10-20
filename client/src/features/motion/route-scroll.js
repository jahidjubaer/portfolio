import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Last scroll position per history entry (location.key), for Back/Forward.
const positions = new Map();

/**
 * Keeps the current history entry's scroll position up to date. The key
 * is read from history.state (React Router's entry key) when the scroll
 * happens, so a scroll caused by a navigation is filed under the entry
 * being shown, never the one being left.
 */
export function useRememberScroll() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    let frame = 0;
    function save() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // The entry the visitor landed on has no state; React Router
        // calls it "default".
        const key = window.history.state?.key ?? "default";
        positions.set(key, window.scrollY);
      });
    }
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", save);
    };
  }, []);
}

/**
 * Rendered at the top of each page (PageTransition remounts it per
 * path). When a page arrives by client navigation it starts at the top,
 * at its #hash target, or — on Back/Forward — where it was left. The
 * first page load is left to the browser.
 *
 * The jump is instant: the site's smooth scrolling is for in-page links,
 * and it runs as the new page mounts, so the old page never jumps while
 * it fades out and a view transition captures the new page at its final
 * scroll position.
 * @param {{ initial: boolean }} props
 */
export function RouteScrollReset({ initial }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const done = useRef(initial);

  useLayoutEffect(() => {
    if (done.current) return;
    done.current = true;

    const target = location.hash
      ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
      : null;
    if (target) {
      target.scrollIntoView({ behavior: "instant" });
      return;
    }
    const restored =
      navigationType === "POP" ? positions.get(location.key) : undefined;
    window.scrollTo({ top: restored ?? 0, behavior: "instant" });
  }, [location, navigationType]);

  return null;
}
