import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { X } from "lucide-react";
import { IconButton } from "../../src/components/ui/IconButton";

describe("IconButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes the `label` prop as its accessible name", () => {
    render(
      <IconButton label="Close menu">
        <X />
      </IconButton>,
    );

    expect(
      screen.getByRole("button", { name: "Close menu" }),
    ).toBeInTheDocument();
  });

  it("warns in development when no accessible label is provided", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <IconButton label="">
        <X />
      </IconButton>,
    );

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("requires a `label` prop"),
    );
  });
});
