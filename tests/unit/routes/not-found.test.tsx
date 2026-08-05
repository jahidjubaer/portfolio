import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "~/routes/not-found";

describe("NotFound route", () => {
  it("renders a not-found heading and a link back home", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to homepage/i }),
    ).toHaveAttribute("href", "/");
  });
});
