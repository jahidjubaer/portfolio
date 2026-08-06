import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ButtonLink } from "../../src/components/ui/ButtonLink";

describe("ButtonLink", () => {
  it("renders a real link when not disabled", () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/work">View work</ButtonLink>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "View work" });
    expect(link).toHaveAttribute("href", "/work");
  });

  it("renders a non-interactive, aria-disabled element instead of a link when disabled", () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/resume" disabled>
          Download résumé
        </ButtonLink>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: "Download résumé" }),
    ).not.toBeInTheDocument();

    const disabledEl = screen.getByText("Download résumé");
    expect(disabledEl.tagName).toBe("SPAN");
    expect(disabledEl).toHaveAttribute("aria-disabled", "true");
  });
});
