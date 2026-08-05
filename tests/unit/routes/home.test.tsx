import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "~/routes/home";

describe("Home route", () => {
  it("renders a single visible h1", () => {
    render(<Home />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Portfolio foundation");
  });
});
