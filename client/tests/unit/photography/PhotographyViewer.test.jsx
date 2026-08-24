import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotographyViewer } from "../../../src/features/photography/PhotographyViewer";

const photograph = {
  id: "street-1",
  src: "/assets/beyond/photography/street/a.webp",
  title: null,
  category: "street",
  alt: "Street photography by Jahid Hasan",
};

function renderViewer(overrides = {}) {
  return render(
    <PhotographyViewer
      photograph={photograph}
      onClose={vi.fn()}
      onPrevious={vi.fn()}
      onNext={vi.fn()}
      hasPrevious={false}
      hasNext={false}
      {...overrides}
    />,
  );
}

describe("PhotographyViewer", () => {
  it("renders the selected photograph with its alt text", () => {
    renderViewer();
    expect(
      screen.getByRole("img", { name: photograph.alt }),
    ).toBeInTheDocument();
  });

  it("closes via the close button", () => {
    const onClose = vi.fn();
    renderViewer({ onClose });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderViewer({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not render previous/next controls when there is only one photograph", () => {
    renderViewer();
    expect(
      screen.queryByRole("button", { name: "Previous photograph" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next photograph" }),
    ).not.toBeInTheDocument();
  });

  it("calls onPrevious and onNext when the controls are present and clicked", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    renderViewer({ onNext, onPrevious, hasPrevious: true, hasNext: true });

    fireEvent.click(screen.getByRole("button", { name: "Next photograph" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Previous photograph" }),
    );
    expect(onNext).toHaveBeenCalled();
    expect(onPrevious).toHaveBeenCalled();
  });

  it("navigates with arrow keys only when a neighbor exists", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    renderViewer({ onNext, onPrevious, hasPrevious: false, hasNext: true });

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(onPrevious).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(onNext).toHaveBeenCalled();
  });

  it("does not render an empty caption element when the photograph has no title", () => {
    renderViewer();
    expect(document.querySelector("figcaption")).not.toBeInTheDocument();
  });

  it("renders a caption when the photograph has a title", () => {
    renderViewer({ photograph: { ...photograph, title: "Street scene" } });
    expect(screen.getByText("Street scene")).toBeInTheDocument();
  });

  it("marks a Bengali caption with lang='bn' but leaves an English caption unmarked", () => {
    renderViewer({
      photograph: { ...photograph, title: "ছবি: আমু বাগান, চুনারুঘাট" },
    });
    expect(screen.getByText("ছবি: আমু বাগান, চুনারুঘাট")).toHaveAttribute(
      "lang",
      "bn",
    );

    renderViewer({ photograph: { ...photograph, title: "Street scene" } });
    expect(screen.getByText("Street scene")).not.toHaveAttribute("lang");
  });

  it("does not render a link to the original post when none is provided", () => {
    renderViewer();
    expect(
      screen.queryByRole("link", { name: /view original post/i }),
    ).not.toBeInTheDocument();
  });

  it("renders an accessible link to the original Blogger post when provided", () => {
    renderViewer({
      photograph: {
        ...photograph,
        postUrl: "https://jahid-thecapturecrew.blogspot.com/2026/06/photo.html",
      },
    });
    const link = screen.getByRole("link", { name: /view original post/i });
    expect(link).toHaveAttribute(
      "href",
      "https://jahid-thecapturecrew.blogspot.com/2026/06/photo.html",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
