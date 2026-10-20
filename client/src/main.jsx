import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { routeConfig } from "./routes/route-config";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles/app.css";

const router = createBrowserRouter(routeConfig);
const container = document.getElementById("root");
const app = (
  <StrictMode>
    <App router={router} />
  </StrictMode>
);

// Public routes arrive prerendered (scripts/prerender.js) and hydrate; the
// SPA fallback (admin, unknown paths) has an empty root and renders fresh.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
