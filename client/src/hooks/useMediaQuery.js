import { useSyncExternalStore } from "react";

function mediaList(query) {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(query)
    : null;
}

/**
 * Whether a CSS media query matches. False on the server and while
 * hydrating (React uses the server snapshot then), so prerendered HTML
 * always hydrates to the same markup and switches right after.
 * @param {string} query
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = mediaList(query);
      list?.addEventListener("change", onChange);
      return () => list?.removeEventListener("change", onChange);
    },
    () => mediaList(query)?.matches ?? false,
    () => false,
  );
}
