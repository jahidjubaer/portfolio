import { describe, expect, it } from "vitest";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotographyGallery } from "../../../src/features/photography/PhotographyGallery";

const fixture = [
  {
    id: "street-1",
    src: "/a.webp",
    title: "A",
    category: "street",
    alt: "Street photography by Jahid Hasan",
  },
  {
    id: "nature-1",
    src: "/b.webp",
    title: "B",
    category: "nature",
    alt: "Nature photography by Jahid Hasan",
  },
];

describe("PhotographyGallery", () => {
  it("renders nothing when there are no photographs", () => {
    const { container } = render(<PhotographyGallery photographs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows category filters when at least two categories exist", () => {
    render(<PhotographyGallery photographs={fixture} />);
    expect(
      screen.getByRole("group", { name: "Filter photography by category" }),
    ).toBeInTheDocument();
  });

  it("hides category filters when only one category exists", () => {
    render(<PhotographyGallery photographs={[fixture[0]]} />);
    expect(
      screen.queryByRole("group", { name: "Filter photography by category" }),
    ).not.toBeInTheDocument();
  });

  it("opens the viewer for a clicked photograph and returns focus to it on close", async () => {
    const user = userEvent.setup();
    render(<PhotographyGallery photographs={fixture} />);

    const trigger = screen.getByRole("button", { name: fixture[0].alt });
    await user.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(trigger).toHaveFocus();
  });

  it("filters the visible photographs by the selected category", async () => {
    const user = userEvent.setup();
    render(<PhotographyGallery photographs={fixture} />);

    await user.click(screen.getByRole("button", { name: "Nature" }));

    expect(
      screen.queryByRole("button", { name: fixture[0].alt }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: fixture[1].alt }),
    ).toBeInTheDocument();
  });
});
