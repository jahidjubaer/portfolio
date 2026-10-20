import { RouterProvider } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { MotionProvider } from "./features/motion/MotionProvider";

/**
 * The whole app around a router: a browser router in main.jsx, a memory
 * router when entry-server.jsx prerenders a page. Both render this same
 * tree, so the prerendered HTML hydrates without mismatches.
 * @param {{ router: import("react-router-dom").DataRouter }} props
 */
export function App({ router }) {
  return (
    <MotionProvider>
      <RouterProvider router={router} />
      {/* Cookie-free Vercel Web Analytics (approved in
          CONTENT_CHECKLIST.md §3). No-ops outside Vercel deployments. */}
      <Analytics />
    </MotionProvider>
  );
}
