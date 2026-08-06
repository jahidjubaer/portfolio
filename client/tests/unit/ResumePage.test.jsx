import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResumePage } from "../../src/pages/ResumePage";
import { profile } from "../../src/data/profile";

describe("ResumePage", () => {
  it("does not link to a résumé PDF while none is available", () => {
    expect(profile.resume.available).toBe(false);

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: /download résumé/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/being prepared/i)).toBeInTheDocument();
  });
});
