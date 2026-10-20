import { useSyncExternalStore } from "react";

/*
 * Public pages are prerendered at build time (scripts/prerender.js) and
 * hydrated in the browser. The first client render must match the HTML
 * exactly, so anything that depends on the visitor (stored preferences,
 * the clock, session state) renders the build's value first and switches
 * right after hydration. useSyncExternalStore does that switch: React
 * reads the server snapshot while hydrating, then the client one.
 */

const subscribe = () => () => {};

/** True on the server and during the hydration render, false after. */
export function useIsHydrating() {
  return useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
}

let serverNow = null;

/** Set by the prerender entry, so every page renders the same "now". */
export function setServerNow(date) {
  serverNow = date;
}

const CLIENT_NOW = new Date();
// The build time the prerendered HTML was rendered with (see
// entry-server.jsx), so relative dates hydrate to the same text.
const RENDERED_AT = (() => {
  if (typeof document === "undefined") return null;
  const stamp = document.getElementById("root")?.dataset.renderedAt;
  return stamp && !Number.isNaN(Date.parse(stamp)) ? new Date(stamp) : null;
})();

/**
 * "Now" for dates shown on the page (relative times, durations, the
 * copyright year): the build time while hydrating, the visitor's time
 * after. Stable for the whole visit, so it never re-renders on its own.
 */
export function useNow() {
  return useSyncExternalStore(
    subscribe,
    () => CLIENT_NOW,
    () => serverNow ?? RENDERED_AT ?? CLIENT_NOW,
  );
}
