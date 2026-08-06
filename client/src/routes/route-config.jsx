import { HomePage } from "../pages/HomePage";
import { WorkPage } from "../pages/WorkPage";
import { ProjectDetailsPage } from "../pages/ProjectDetailsPage";
import { AboutPage } from "../pages/AboutPage";
import { BeyondPage } from "../pages/BeyondPage";
import { ContactPage } from "../pages/ContactPage";
import { ResumePage } from "../pages/ResumePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ErrorPage } from "../pages/ErrorPage";

export const routeConfig = [
  { path: "/", element: <HomePage />, errorElement: <ErrorPage /> },
  { path: "/work", element: <WorkPage />, errorElement: <ErrorPage /> },
  {
    path: "/work/:slug",
    element: <ProjectDetailsPage />,
    errorElement: <ErrorPage />,
  },
  { path: "/about", element: <AboutPage />, errorElement: <ErrorPage /> },
  { path: "/beyond", element: <BeyondPage />, errorElement: <ErrorPage /> },
  { path: "/contact", element: <ContactPage />, errorElement: <ErrorPage /> },
  { path: "/resume", element: <ResumePage />, errorElement: <ErrorPage /> },
  { path: "*", element: <NotFoundPage />, errorElement: <ErrorPage /> },
];
