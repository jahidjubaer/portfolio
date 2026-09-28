import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

describe("HomePage", () => {
  it("renders a single visible H1", () => {
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(
      "I build clear interfaces for real product problems.",
    );
  });

  it("offers a skip-to-case-studies link that targets the featured section", () => {
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
    const { container } = render(<RouterProvider router={router} />);

    const skipLink = screen.getByRole("link", {
      name: /skip to case studies/i,
    });
    expect(skipLink).toHaveAttribute("href", "#featured-work");
    expect(container.querySelector("#featured-work")).not.toBeNull();
  });
});
