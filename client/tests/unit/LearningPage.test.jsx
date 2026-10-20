import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LearningTrackCard } from "../../src/features/learning-tracks/LearningTrackCard";

async function renderPage() {
  const { LearningPage } = await import("../../src/pages/LearningPage");
  render(
    <MemoryRouter>
      <LearningPage />
    </MemoryRouter>,
  );
}

describe("LearningPage", () => {
  it("shows the method, then tracks grouped by status", async () => {
    await renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "Learning" }),
    ).toBeInTheDocument();
    const steps = screen
      .getByRole("heading", { level: 2, name: "How I learn" })
      .closest("section");
    expect(
      within(steps)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Learn", "Practice", "Build", "Write"]);
    expect(
      screen.getByRole("heading", { level: 2, name: "Now learning" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "React & frontend" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "In progress" })).toBeNull();
    expect(screen.getByRole("link", { name: "Writing" })).toHaveAttribute(
      "href",
      "/writing",
    );
  });

  it("falls back to courses in progress while no tracks exist", async () => {
    vi.resetModules();
    vi.doMock("../../src/data/learning", async (importOriginal) => ({
      ...(await importOriginal()),
      learningTracks: [],
    }));
    await renderPage();
    expect(
      screen.getByRole("heading", { level: 2, name: "In progress" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Reactive Accelerator" }),
    ).toBeInTheDocument();
    vi.doUnmock("../../src/data/learning");
  });
});

describe("LearningTrackCard", () => {
  it("lays out the path and links what was built", () => {
    render(
      <MemoryRouter>
        <LearningTrackCard
          track={{
            id: "react",
            title: "Advanced React",
            status: "learning",
            since: "2026-01",
            resources: [
              {
                label: "Reactive Accelerator",
                url: "https://example.com/course",
                organization: { id: "lws", name: "Learn with Sumit" },
              },
            ],
            certifications: [],
            practice: "Exercises after each module.",
            projects: [{ slug: "sarabo", title: "Sarabo" }],
            notes: [],
            repos: [],
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Since Jan 2026")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Reactive Accelerator/ }),
    ).toHaveAttribute("href", "https://example.com/course");
    expect(screen.getByText(/\(Learn with Sumit\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sarabo" })).toHaveAttribute(
      "href",
      "/work/sarabo",
    );
    // Empty rows are left out.
    expect(screen.queryByText("Notes")).toBeNull();
  });
});
