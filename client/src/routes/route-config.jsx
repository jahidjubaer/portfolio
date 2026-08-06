import { AppLayout } from "../layouts/AppLayout";
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
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "work", element: <WorkPage /> },
      { path: "work/:slug", element: <ProjectDetailsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "beyond", element: <BeyondPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "resume", element: <ResumePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
