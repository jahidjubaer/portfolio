import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CertificationsSection } from "../../src/features/profile/CertificationsSection";
import { certifications } from "../../src/data/certifications";

describe("CertificationsSection", () => {
  it("lists every certification under its group heading", () => {
    render(<CertificationsSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Certifications & training",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Professional" }),
    ).toBeInTheDocument();
    // Groups without entries (leadership, other) are not rendered.
    expect(
      screen.queryByRole("heading", { level: 3, name: "Leadership" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(
      certifications.length,
    );
  });

  it("shows the year when completed and a badge while in progress", () => {
    render(<CertificationsSection />);

    const python = screen
      .getByRole("heading", { name: /python programming/i })
      .closest("li");
    expect(within(python).getByText("2024")).toBeInTheDocument();

    const reactive = screen
      .getByRole("heading", { name: "Reactive Accelerator" })
      .closest("li");
    expect(within(reactive).getByText("In progress")).toBeInTheDocument();
  });
});
