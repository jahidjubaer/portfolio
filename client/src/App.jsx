import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "./routes/route-config";

const router = createBrowserRouter(routeConfig);

export function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <RouterProvider router={router} />
    </>
  );
}
