import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const unavailableImage = { available: false, src: null, fallback: "" };
const unavailableProject = { cover: unavailableImage, gallery: [] };

function mockManifest(resume) {
  vi.doMock("../../src/generated/asset-manifest", () => ({
    assetManifest: {
      profile: { portrait: unavailableImage, portraitSquare: unavailableImage },
      resume,
      projects: {
        sarabo: unavailableProject,
        bangLearner: unavailableProject,
        noteBank: unavailableProject,
      },
    },
  }));
}

describe("ResumePage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("shows a download link when the résumé PDF is available", async () => {
    mockManifest({
      available: true,
      src: "/assets/resume/jahid-hasan-resume.pdf",
    });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: /download résumé/i }),
    ).toHaveAttribute("href", "/assets/resume/jahid-hasan-resume.pdf");
  });

  it("does not link to a résumé PDF while none is available", async () => {
    mockManifest({ available: false, src: null });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: /download résumé/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/being prepared/i)).toBeInTheDocument();
  });

  it("uses the correct download filename when the résumé is available", async () => {
    mockManifest({
      available: true,
      src: "/assets/resume/jahid-hasan-resume.pdf",
    });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: /download résumé/i }),
    ).toHaveAttribute("download", "jahid-hasan-resume.pdf");
  });

  it("shows education and selected projects", async () => {
    mockManifest({ available: false, src: null });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("BSc in Computer Science and Engineering"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Selected projects" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sarabo")).toBeInTheDocument();
    expect(screen.getByText("Bang Learner")).toBeInTheDocument();
    expect(screen.getByText("Note Bank")).toBeInTheDocument();
  });

  it("shows verified leadership roles", async () => {
    mockManifest({ available: false, src: null });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Leadership" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Organizing Secretary").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText(/Metropolitan University Sports Club/).length,
    ).toBeGreaterThan(0);
  });

  it("does not claim the PDF is still being prepared once it is available", async () => {
    mockManifest({
      available: true,
      src: "/assets/resume/jahid-hasan-resume.pdf",
    });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    const description = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    expect(description).not.toMatch(/being prepared/i);
  });

  it("does not claim unsupported professional experience", async () => {
    mockManifest({ available: false, src: null });
    const { ResumePage } = await import("../../src/pages/ResumePage");

    const { container } = render(
      <MemoryRouter>
        <ResumePage />
      </MemoryRouter>,
    );

    const text = container.textContent;
    expect(text).not.toMatch(/years? of experience/i);
    expect(text).not.toMatch(/senior/i);
  });
});
