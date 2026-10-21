import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("LearningPage journal", () => {
  const TRACK = {
    id: "react",
    title: "Advanced React",
    status: "learning",
    goal: "Ship a full-stack app with auth.",
    resources: [],
    certifications: [],
    projects: [],
    notes: [],
    repos: [],
    syllabus: [
      { title: "Rendering", status: "done", date: "2026-10-01" },
      { title: "Hooks", status: "doing" },
      { title: "Suspense", status: "todo" },
    ],
  };
  const OTHER = { ...TRACK, id: "dsa", title: "Algorithms", syllabus: [] };
  const entry = (id, date, trackId, extra) => ({
    id,
    date,
    trackId,
    trackTitle: trackId === "react" ? TRACK.title : OTHER.title,
    body: `Notes ${id}.`,
    links: [],
    ...extra,
  });

  it("shows now studying, the topic path, and a filterable log", async () => {
    vi.resetModules();
    vi.doMock("../../src/data/learning", async (importOriginal) => ({
      ...(await importOriginal()),
      learningTracks: [TRACK, OTHER],
      studyLog: [
        entry("e1", "2026-10-20", "react", { topic: "Hooks", minutes: 90 }),
        entry("e2", "2026-10-18", "dsa"),
      ],
    }));
    const user = userEvent.setup();
    await renderPage();

    const now = screen
      .getByRole("heading", { level: 2, name: "Now studying" })
      .closest("section");
    expect(within(now).getAllByText("1 of 3 topics done")).toHaveLength(1);
    expect(within(now).getByText("Hooks")).toBeInTheDocument();

    const topics = screen.getAllByRole("button", { name: /Topics/ })[0];
    expect(topics).toHaveAttribute("aria-expanded", "false");
    await user.click(topics);
    expect(topics).toHaveAttribute("aria-expanded", "true");
    const path = document.getElementById(topics.getAttribute("aria-controls"));
    expect(path).not.toHaveAttribute("hidden");
    expect(within(path).getByText("▸ You are here")).toBeInTheDocument();

    const log = screen
      .getByRole("heading", { level: 2, name: "Study log" })
      .closest("section");
    expect(within(log).getByText(/2 study days/)).toBeInTheDocument();
    expect(within(log).getByText("Notes e2.")).toBeInTheDocument();
    await user.click(
      within(log).getByRole("button", { name: "Advanced React" }),
    );
    expect(within(log).queryByText("Notes e2.")).toBeNull();
    expect(within(log).getByText("1 h 30 min")).toBeInTheDocument();
    vi.doUnmock("../../src/data/learning");
  });
});
