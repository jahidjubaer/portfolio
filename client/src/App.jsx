import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "./routes/route-config";
import { MotionProvider } from "./features/motion/MotionProvider";

const router = createBrowserRouter(routeConfig);

export function App() {
  return (
    <MotionProvider>
      <RouterProvider router={router} />
    </MotionProvider>
  );
}
