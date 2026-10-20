import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CredentialsPage } from "../../src/pages/CredentialsPage";
import {
  certifications,
  groupCertifications,
  resolveCertification,
} from "../../src/data/certifications";

function renderPage() {
  render(
    <MemoryRouter>
      <CredentialsPage />
    </MemoryRouter>,
  );
}

function section(name) {
  return screen.getByRole("heading", { level: 2, name }).closest("section");
}

describe("CredentialsPage", () => {
  it("has one H1, education, and separate certification and course sections", () => {
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 2, name: "Education" }),
    ).toBeInTheDocument();
    expect(section("Certifications")).toBeInTheDocument();
    expect(section("Courses")).toBeInTheDocument();
  });

  it("shows the degree in LinkedIn's form", () => {
    renderPage();
    expect(
      screen.getByText("BSc, Computer Science and Engineering"),
    ).toBeInTheDocument();
    expect(screen.getByText("Jul 2022 – Jul 2026")).toBeInTheDocument();
  });

  it("puts every item under its kind, grouped by category", () => {
    renderPage();
    for (const [kind, name] of [
      ["certification", "Certifications"],
      ["course", "Courses"],
    ]) {
      const items = within(section(name)).getAllByRole("heading", {
        level: 4,
      });
      expect(items).toHaveLength(
        certifications.filter((item) => item.kind === kind).length,
      );
      const groups = within(section(name))
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent);
      expect(groups.length).toBeGreaterThan(0);
      for (const group of groups) {
        expect(["Professional", "Leadership & community"]).toContain(group);
      }
    }
  });
});

describe("groupCertifications", () => {
  const organization = { id: "org", name: "Org" };
  const item = (id, kind, category) => ({
    id,
    title: id,
    kind,
    category,
    status: "completed",
    organization,
  });

  it("splits by kind, then category, leaving out empty groups", () => {
    const grouped = groupCertifications([
      item("a", "course", "leadership-community"),
      item("b", "certification", "professional"),
      item("c", "course", "professional"),
    ]);
    expect(
      grouped.map((kind) => [
        kind.id,
        kind.groups.map((group) => [
          group.id,
          group.items.map((entry) => entry.id),
        ]),
      ]),
    ).toEqual([
      ["certification", [["professional", ["b"]]]],
      [
        "course",
        [
          ["professional", ["c"]],
          ["leadership-community", ["a"]],
        ],
      ],
    ]);
  });

  it("treats a missing category as professional", () => {
    const resolved = resolveCertification(
      { id: "x", organizationId: "org", kind: "course", order: 1 },
      () => organization,
    );
    expect(resolved.category).toBe("professional");
  });
});
