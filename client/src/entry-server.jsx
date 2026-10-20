import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { createMemoryRouter } from "react-router-dom";
import { App } from "./App";
import { routeConfig } from "./routes/route-config";
import { setServerNow } from "./lib/hydration";

async function renderOnce(path) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  const { prelude } = await prerender(
    <StrictMode>
      <App router={router} />
    </StrictMode>,
    // React moves a Suspense boundary bigger than ~12 kB into a later
    // chunk revealed by an inline script; a page is one static document.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );
  const html = await new Response(prelude).text();
  router.dispose();
  return html;
}

// React's streaming "reveal" scripts for a boundary that suspended.
const SUSPENSE_SCRIPT = /<script>\$R|<template id="/;

/**
 * Renders one public route to HTML at build time (scripts/prerender.js).
 * The first pass loads the route's lazy pages; the second renders with
 * them in place, so nothing suspends: the HTML is the complete page with
 * no inline scripts (the CSP only allows the head script).
 * @param {string} path e.g. "/work/sarabo"
 * @param {Date} now the "now" every date on the page is computed from
 * @returns {Promise<string>} the markup for <div id="root">
 */
export async function renderPage(path, now) {
  setServerNow(now);
  await renderOnce(path);
  const html = await renderOnce(path);
  if (SUSPENSE_SCRIPT.test(html)) {
    throw new Error("a lazy part still suspended; rendering it in the browser");
  }
  return html;
}
