import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ExperienceList } from "../../src/features/experience/ExperienceList";
import { experienceGroups } from "../../src/data/experience";

const club = {
  id: "club",
  name: "Metropolitan University Sports Club",
  url: "https://example.org/club",
};

const multiRole = {
  id: "club",
  category: "leadership",
  organization: club,
  roles: [
    {
      title: "Organizing Secretary",
      employmentType: "part-time",
      start: "2024",
      end: "2025",
      location: "Sylhet",
      workplace: "on-site",
      description: "Coordinated the leagues.",
      skills: ["Event management", "Leadership"],
    },
    { title: "Joint Office Secretary", start: "2023", end: "2024" },
  ],
  span: { start: "2023", end: "2025", current: false },
  totalDuration: "2 yrs",
};

const singleRole = {
  id: "society",
  category: "leadership",
  organization: { id: "society", name: "Photographic Society" },
  roles: [{ title: "Organizing Secretary", start: "2024", end: "2025" }],
  span: { start: "2024", end: "2025", current: false },
  totalDuration: "1 yr",
};

describe("ExperienceList (LinkedIn layout)", () => {
  it("writes the organization once and lists its roles under it", () => {
    render(<ExperienceList groups={[multiRole]} />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent(club.name);
    expect(within(heading).getByRole("link")).toHaveAttribute("href", club.url);
    expect(screen.getAllByText(new RegExp(club.name))).toHaveLength(1);
    expect(screen.getByText("2 yrs")).toBeInTheDocument();

    const roles = screen.getAllByRole("heading", { level: 4 });
    expect(roles.map((role) => role.textContent)).toEqual([
      "Organizing Secretary",
      "Joint Office Secretary",
    ]);
    expect(screen.getByText("Part-time")).toBeInTheDocument();
    expect(screen.getByText("2024 – 2025 · 1 yr")).toBeInTheDocument();
    expect(screen.getByText("Sylhet · On-site")).toBeInTheDocument();
    expect(
      screen.getByText("Event management · Leadership"),
    ).toBeInTheDocument();
  });

  it("leads with the title when there is only one role", () => {
    render(<ExperienceList groups={[singleRole]} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Organizing Secretary",
    );
    expect(screen.getByText("Photographic Society")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 4 })).toBeNull();
  });

  it("separates organizations without joining them", () => {
    const { container } = render(
      <ExperienceList groups={[multiRole, singleRole]} />,
    );
    const items = container.querySelectorAll(":scope > ul > li");
    expect(items).toHaveLength(2);
    // One connector, between the two roles of the first organization.
    expect(container.querySelectorAll(".w-px")).toHaveLength(1);
  });
});

describe("experienceGroups (published data)", () => {
  it("groups the Sports Club roles together, newest organization first", () => {
    const club = experienceGroups.find(
      (group) =>
        group.organization.id === "metropolitan-university-sports-club",
    );
    expect(club.roles.map((role) => role.title)).toEqual([
      "Organizing Secretary",
      "Joint Office Secretary",
      "Member",
    ]);
    // Sep 2022 – Jan 2026 in the published data.
    expect(club.totalDuration).toBe("3 yrs 5 mos");
    expect(experienceGroups.at(-1).organization.name).toMatch(/Red Crescent/);
  });
});
