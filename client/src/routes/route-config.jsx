import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { HomePage } from "../pages/HomePage";
import { ErrorPage } from "../pages/ErrorPage";
import { RouteLoading } from "../components/feedback/RouteLoading";

// Route-level code splitting: the homepage stays eager (it's the initial
// SYSTEM entry point and must render with no extra network round-trip),
// while every secondary route loads on demand so its route-specific
// features (contact form, photography gallery, project galleries, resume)
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
const BeyondPage = lazy(() =>
  import("../pages/BeyondPage").then((m) => ({ default: m.BeyondPage })),
);
const ContactPage = lazy(() =>
  import("../pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const LearningPage = lazy(() =>
  import("../pages/LearningPage").then((m) => ({ default: m.LearningPage })),
);
const WritingPage = lazy(() =>
  import("../pages/WritingPage").then((m) => ({ default: m.WritingPage })),
);
const PostPage = lazy(() =>
  import("../pages/PostPage").then((m) => ({ default: m.PostPage })),
);
const CredentialsPage = lazy(() =>
  import("../pages/CredentialsPage").then((m) => ({
    default: m.CredentialsPage,
  })),
);
const ResumePage = lazy(() =>
  import("../pages/ResumePage").then((m) => ({ default: m.ResumePage })),
);
// Admin lives outside the public shell (no rails, greeting, or palette)
// and loads as one chunk, only when /admin is visited.
const loadAdmin = () => import("../pages/admin");
const AdminLayout = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminLayout })),
);
const AdminOverview = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminOverview })),
);
const AdminSingletonPage = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminSingletonPage })),
);
const AdminListPage = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminListPage })),
);
const AdminItemPage = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminItemPage })),
);
const AdminRepositoriesPage = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminRepositoriesPage })),
);
const AdminMessagesPage = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminMessagesPage })),
);
const AdminLinkedInImportPage = lazy(() =>
  loadAdmin().then((m) => ({ default: m.AdminLinkedInImportPage })),
);

const ADMIN_LISTS = [
  "projects",
  "organizations",
  "experience",
  "education",
  "skills",
  "certifications",
  "learningTracks",
  "studyLog",
  "posts",
  "photos",
];
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

export const routeConfig = [
  {
    path: "/admin",
    element: (
      <Suspense fallback={<RouteLoading />}>
        <AdminLayout />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: "profile", element: <AdminSingletonPage name="profile" /> },
      { path: "beyond", element: <AdminSingletonPage name="beyond" /> },
      { path: "learning", element: <AdminSingletonPage name="learning" /> },
      { path: "settings", element: <AdminSingletonPage name="settings" /> },
      { path: "repositories", element: <AdminRepositoriesPage /> },
      { path: "messages", element: <AdminMessagesPage /> },
      { path: "linkedin-import", element: <AdminLinkedInImportPage /> },
      ...ADMIN_LISTS.flatMap((name) => [
        { path: name, element: <AdminListPage name={name} /> },
        { path: `${name}/new`, element: <AdminItemPage name={name} /> },
        { path: `${name}/:key`, element: <AdminItemPage name={name} /> },
      ]),
    ],
  },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "work", element: <WorkPage /> },
      { path: "work/:slug", element: <ProjectDetailsPage /> },
      // /about content now lives in the profile's Resume tab.
      { path: "about", element: <Navigate to="/" replace /> },
      { path: "credentials", element: <CredentialsPage /> },
      { path: "learning", element: <LearningPage /> },
      { path: "writing", element: <WritingPage /> },
      { path: "writing/:slug", element: <PostPage /> },
      // /blog is an alias, not a second page — it redirects so /writing
      // stays the one canonical URL.
      { path: "blog", element: <Navigate to="/writing" replace /> },
      { path: "beyond", element: <BeyondPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "resume", element: <ResumePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
