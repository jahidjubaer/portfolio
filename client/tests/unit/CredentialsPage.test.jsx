import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CredentialsPage } from "../../src/pages/CredentialsPage";
import { certifications } from "../../src/data/certifications";

function renderPage() {
  render(
    <MemoryRouter>
      <CredentialsPage />
    </MemoryRouter>,
  );
}

function certificationsSection() {
  return screen
    .getByRole("heading", { level: 2, name: "Licenses & certifications" })
    .closest("section");
}

describe("CredentialsPage", () => {
  it("has one H1 and both sections", () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 2, name: "Education" }),
    ).toBeInTheDocument();
    expect(certificationsSection()).toBeInTheDocument();
  });

  it("shows the degree in LinkedIn's form", () => {
    renderPage();
    expect(
      screen.getByText("BSc, Computer Science and Engineering"),
    ).toBeInTheDocument();
    expect(screen.getByText("Jul 2022 – Aug 2026")).toBeInTheDocument();
  });

  it("filters certifications and courses", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = certificationsSection();
    const count = () => within(section).getAllByRole("heading", { level: 3 });
    expect(count()).toHaveLength(certifications.length);

    await user.click(within(section).getByRole("button", { name: "Courses" }));
    expect(
      within(section).getByRole("button", { name: "Courses" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(count()).toHaveLength(
      certifications.filter((item) => item.kind === "course").length,
    );

    await user.click(within(section).getByRole("button", { name: "All" }));
    expect(count()).toHaveLength(certifications.length);
  });
});
