import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { routeConfig } from "./routes/route-config";
import { MotionProvider } from "./features/motion/MotionProvider";

const router = createBrowserRouter(routeConfig);

export function App() {
  return (
    <MotionProvider>
      <RouterProvider router={router} />
      {/* Cookie-free Vercel Web Analytics (approved in
          CONTENT_CHECKLIST.md §3). No-ops outside Vercel deployments. */}
      <Analytics />
    </MotionProvider>
  );
}
