import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ErrorPage } from "../../src/pages/ErrorPage";

function ThrowingRoute() {
  throw new Error("boom");
}

describe("ErrorPage", () => {
  it("provides recovery navigation back to the homepage", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <ThrowingRoute />,
          errorElement: <ErrorPage />,
        },
      ],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);

    const link = screen.getByRole("link", { name: "Return to the homepage" });
    expect(link).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" }),
    ).toBeInTheDocument();
  });
});
