import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Last scroll position per history entry (location.key), for Back/Forward.
const positions = new Map();
// The entry whose page is on screen, set as each page mounts.
let shownKey = null;

/**
 * Keeps the shown page's scroll position up to date. Scroll events are
 * filed under the entry whose page is on screen (set by RouteScrollReset
 * as each page mounts), not the one history has moved to: a scroll event
 * can arrive a frame late, after Back has already changed the entry, and
 * would otherwise overwrite the position Back is about to restore.
 */
export function useRememberScroll() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    function save() {
      if (shownKey) positions.set(shownKey, window.scrollY);
    }
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
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
  const done = useRef(false);

  useLayoutEffect(() => {
    if (done.current) return;
    done.current = true;
    shownKey = location.key;
    if (initial) return;

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
  }, [initial, location, navigationType]);

  return null;
}
