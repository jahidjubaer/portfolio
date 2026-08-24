import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const availablePortrait = {
  available: true,
  src: "/assets/profile/profile-portrait-square.webp",
  fallback: "/assets/placeholders/profile-placeholder.svg",
};
const unavailableImage = { available: false, src: null, fallback: "" };
const unavailableProject = { cover: unavailableImage, gallery: [] };

function mockManifest() {
  vi.doMock("../../src/generated/asset-manifest", () => ({
    assetManifest: {
      profile: {
        portrait: availablePortrait,
        portraitSquare: availablePortrait,
      },
      resume: { available: false, src: null },
      projects: {
        sarabo: unavailableProject,
        bangLearner: unavailableProject,
        noteBank: unavailableProject,
      },
    },
  }));
}

describe("AboutPage", () => {
  beforeEach(() => {
    vi.resetModules();
    mockManifest();
  });

  it("renders the real portrait path from the asset manifest", async () => {
    const { AboutPage } = await import("../../src/pages/AboutPage");

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("img", { name: /portrait of jahid hasan/i }),
    ).toHaveAttribute("src", "/assets/profile/profile-portrait-square.webp");
  });

  it("renders the main professional title", async () => {
    const { AboutPage } = await import("../../src/pages/AboutPage");

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Frontend Developer & Junior Software Engineer"),
    ).toBeInTheDocument();
  });

  it("clearly separates current strengths from currently-expanding skills", async () => {
    const { AboutPage } = await import("../../src/pages/AboutPage");

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Current strengths" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Currently expanding" }),
    ).toBeInTheDocument();
  });

  it("renders the verified timeline section", async () => {
    const { AboutPage } = await import("../../src/pages/AboutPage");

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Timeline" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Graduation")).toBeInTheDocument();
  });

  it("shows problem-solving evidence only from verified data", async () => {
    const { AboutPage } = await import("../../src/pages/AboutPage");

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/250\+ programming problems solved/),
    ).toBeInTheDocument();
  });
});
