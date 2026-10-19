import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CertificationsSection } from "../../src/features/profile/CertificationsSection";
import { certifications } from "../../src/data/certifications";

function renderSection() {
  render(
    <MemoryRouter>
      <CertificationsSection />
    </MemoryRouter>,
  );
}

describe("CertificationsSection (profile preview)", () => {
  const featured = certifications.filter((item) => item.featured);

  it("previews the ones chosen for the profile and links to the rest", () => {
    renderSection();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Licenses & certifications",
      }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(featured.map((item) => item.title));
    expect(
      screen.getByRole("link", {
        name: `Show all ${certifications.length} licenses & certifications`,
      }),
    ).toHaveAttribute("href", "/credentials#certifications");
  });

  it("puts courses in progress first, with a badge and the issuer", () => {
    renderSection();
    const [first] = screen.getAllByRole("listitem");
    expect(
      within(first).getByRole("heading", { name: featured[0].title }),
    ).toBeInTheDocument();
    expect(within(first).getByText("In progress")).toBeInTheDocument();
    expect(
      within(first).getByText(featured[0].organization.name),
    ).toBeInTheDocument();
  });
});
