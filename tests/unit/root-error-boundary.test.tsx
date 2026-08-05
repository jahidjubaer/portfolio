import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorBoundary } from "~/root";

describe("Root ErrorBoundary", () => {
  it("renders a heading, message, and recovery link for an unexpected error", () => {
    const error = new Error("Something exploded");
    // @ts-expect-error -- test passes a plain Error; real usage receives Route.ErrorBoundaryProps
    render(<ErrorBoundary error={error} />);

    expect(
      screen.getByRole("heading", { level: 1, name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to the homepage/i }),
    ).toHaveAttribute("href", "/");
  });
});
