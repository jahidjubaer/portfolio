import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CapabilitiesPreview } from "../../src/sections/home/CapabilitiesPreview";
import { capabilityGroups } from "../../src/data/capabilities";

function renderSection() {
  return render(<CapabilitiesPreview />);
}

describe("CapabilitiesPreview", () => {
  it("renders all three capability group labels", () => {
    renderSection();
    for (const group of capabilityGroups) {
      expect(
        screen.getByRole("heading", { name: group.title }),
      ).toBeInTheDocument();
    }
  });

  it("renders every current-strengths skill", () => {
    renderSection();
    const group = capabilityGroups.find((g) => g.id === "current-strengths");
    for (const item of group.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders every engineering-foundations skill", () => {
    renderSection();
    const group = capabilityGroups.find(
      (g) => g.id === "engineering-foundations",
    );
    for (const item of group.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders every currently-expanding skill", () => {
    renderSection();
    const group = capabilityGroups.find((g) => g.id === "currently-expanding");
    for (const item of group.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("keeps skill collections as semantic lists", () => {
    const { container } = renderSection();
    // Current strengths (ul) + engineering foundations (ol) + currently
    // expanding (ul) — three distinct skill collections, all real lists.
    expect(container.querySelectorAll("ul, ol").length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it("never renders proficiency percentages or skill-level claims", () => {
    const { container } = renderSection();
    const text = container.textContent;
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/\b(advanced|expert|beginner|proficient)\b/i);
    expect(text).not.toMatch(/\d\s*\/\s*5/);
  });
});
