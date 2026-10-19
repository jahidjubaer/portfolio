import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("Beyond languages & interests", () => {
  it("lists languages with their level, and interests", async () => {
    vi.resetModules();
    vi.doMock("../../src/data/beyond", async (importOriginal) => ({
      ...(await importOriginal()),
      languages: [
        { name: "Bangla", level: "Native" },
        { name: "English", level: "Upper-intermediate (B2)" },
      ],
      interests: ["Photography", "Leadership"],
    }));
    const { BeyondPage } = await import("../../src/pages/BeyondPage");
    render(
      <MemoryRouter>
        <BeyondPage />
      </MemoryRouter>,
    );
    const section = screen
      .getByRole("heading", { level: 2, name: "Languages & interests" })
      .closest("section");
    expect(within(section).getByText("Upper-intermediate (B2)")).toBeVisible();
    expect(within(section).getByText("Photography")).toBeInTheDocument();
    vi.doUnmock("../../src/data/beyond");
  });
});
