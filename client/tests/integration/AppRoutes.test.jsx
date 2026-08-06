import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

const routes = [
  { path: "/", heading: "I build clear interfaces for real product problems." },
  { path: "/work", heading: "Projects I've built" },
  { path: "/about", heading: "About Jahid" },
  { path: "/beyond", heading: "Beyond the code" },
  { path: "/contact", heading: "Get in touch" },
  { path: "/resume", heading: "Résumé" },
];

describe("Main application routes", () => {
  it.each(routes)("renders $path with its H1", ({ path, heading }) => {
    const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
  });
});
