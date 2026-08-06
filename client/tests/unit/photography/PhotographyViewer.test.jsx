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
});
