import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectLinks } from "../../../src/features/projects/ProjectLinks";

describe("ProjectLinks", () => {
  it("renders a descriptive external link for each valid link", () => {
    render(
      <ProjectLinks
        links={[
          {
            label: "Live client",
            url: "https://sarabo-jahid.web.app",
            type: "live",
          },
          {
            label: "Live API",
            url: "https://sarabo-server.vercel.app",
            type: "live",
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: /Live client/ })).toHaveAttribute(
      "href",
      "https://sarabo-jahid.web.app",
    );
    expect(screen.getByRole("link", { name: /Live API/ })).toHaveAttribute(
      "href",
      "https://sarabo-server.vercel.app",
    );
  });

  it("opens external links in a new tab safely", () => {
    render(
      <ProjectLinks
        links={[
          {
            label: "Repository",
            url: "https://github.com/example",
            type: "repository",
          },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: /Repository/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("skips links with no url", () => {
    render(
      <ProjectLinks
        links={[{ label: "Repository", url: null, type: "repository" }]}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<ProjectLinks links={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
