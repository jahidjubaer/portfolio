import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { HomePage } from "../pages/HomePage";
import { ErrorPage } from "../pages/ErrorPage";

// Route-level code splitting: the homepage stays eager (it's the initial
// SYSTEM entry point and must render with no extra network round-trip),
// while every secondary route loads on demand so its route-specific
// features (contact form, photography gallery, project galleries, résumé)
// never inflate the initial homepage bundle. AppLayout wraps the outlet in
// a Suspense boundary (see RouteLoading) so this needs no per-route
// fallback wiring here.
const WorkPage = lazy(() =>
  import("../pages/WorkPage").then((m) => ({ default: m.WorkPage })),
);
const ProjectDetailsPage = lazy(() =>
  import("../pages/ProjectDetailsPage").then((m) => ({
    default: m.ProjectDetailsPage,
  })),
);
const AboutPage = lazy(() =>
  import("../pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const BeyondPage = lazy(() =>
  import("../pages/BeyondPage").then((m) => ({ default: m.BeyondPage })),
);
const ContactPage = lazy(() =>
  import("../pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const LearningPage = lazy(() =>
  import("../pages/LearningPage").then((m) => ({ default: m.LearningPage })),
);
const ResumePage = lazy(() =>
  import("../pages/ResumePage").then((m) => ({ default: m.ResumePage })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

export const routeConfig = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "work", element: <WorkPage /> },
      { path: "work/:slug", element: <ProjectDetailsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "learning", element: <LearningPage /> },
      // /blog is an alias, not a second page — it redirects so /learning
      // stays the single canonical URL (see LearningPage's usePageMeta).
      { path: "blog", element: <Navigate to="/learning" replace /> },
      { path: "beyond", element: <BeyondPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "resume", element: <ResumePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
