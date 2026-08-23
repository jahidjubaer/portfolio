import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteLoading } from "../../src/components/feedback/RouteLoading";

describe("RouteLoading", () => {
  it("announces loading state accessibly, without a fake progress value", () => {
    render(<RouteLoading />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading page…");
    expect(status.textContent).not.toMatch(/%/);
  });
});
