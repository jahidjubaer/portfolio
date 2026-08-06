import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BeyondPortal } from "../../src/sections/home/BeyondPortal";

describe("BeyondPortal", () => {
  it("uses the abstract fallback preview when no Beyond image is available", () => {
    render(
      <MemoryRouter>
        <BeyondPortal />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("There is more behind the interface."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("links to /beyond", () => {
    render(
      <MemoryRouter>
        <BeyondPortal />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: "Explore Beyond the Code" }),
    ).toHaveAttribute("href", "/beyond");
  });
});
