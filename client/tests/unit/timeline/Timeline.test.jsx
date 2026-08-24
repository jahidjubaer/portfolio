import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "../../../src/features/timeline/Timeline";
import { timelineEvents } from "../../../src/data/timeline";

describe("Timeline", () => {
  it("renders every event derived from the timeline data", () => {
    render(<Timeline />);
    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(timelineEvents.map((event) => event.title));

    const uniqueOrganizations = new Set(
      timelineEvents.map((event) => event.organization),
    );
    for (const organization of uniqueOrganizations) {
      expect(screen.getAllByText(organization).length).toBeGreaterThan(0);
    }
  });

  it("renders every verified date", () => {
    render(<Timeline />);
    const uniqueDates = new Set(timelineEvents.map((event) => event.date));
    for (const date of uniqueDates) {
      expect(screen.getAllByText(date).length).toBeGreaterThan(0);
    }
  });

  it("renders events in chronological (ascending year) order", () => {
    render(<Timeline />);
    const items = screen.getAllByRole("listitem");
    const renderedTitles = items.map(
      (item) => item.querySelector("h3")?.textContent,
    );
    const expectedTitles = [...timelineEvents]
      .sort((a, b) => a.sortYear - b.sortYear)
      .map((event) => event.title);
    expect(renderedTitles).toEqual(expectedTitles);
  });

  it("renders a category label for every event", () => {
    render(<Timeline />);
    expect(screen.getAllByText("Leadership").length).toBeGreaterThan(0);
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
  });

  it("uses a semantic ordered list structure", () => {
    render(<Timeline />);
    expect(screen.getByRole("list").tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(timelineEvents.length);
  });

  it("never invents events beyond the verified data set", () => {
    render(<Timeline />);
    expect(screen.getAllByRole("listitem")).toHaveLength(timelineEvents.length);
  });

  it("never claims a completion percentage", () => {
    const { container } = render(<Timeline />);
    expect(container.textContent).not.toMatch(/\d+\s*%/);
  });
});
