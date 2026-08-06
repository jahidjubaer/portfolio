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
});
