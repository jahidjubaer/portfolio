import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectMediaGallery } from "../../../src/features/projects/ProjectMediaGallery";

describe("ProjectMediaGallery", () => {
  it("renders only the available images passed in", () => {
    render(
      <ProjectMediaGallery
        title="Sarabo"
        images={[
          {
            file: "screenshot-01.webp",
            src: "/assets/projects/sarabo/screenshot-01.webp",
          },
          {
            file: "screenshot-02.webp",
            src: "/assets/projects/sarabo/screenshot-02.webp",
          },
        ]}
        captionsByFile={{
          "screenshot-01.webp": "Sarabo administrator dashboard",
        }}
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(
      screen.getByAltText("Sarabo administrator dashboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Sarabo interface preview 2"),
    ).toBeInTheDocument();
  });

  it("renders nothing when there are no images", () => {
    const { container } = render(
      <ProjectMediaGallery title="Bang Learner" images={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
