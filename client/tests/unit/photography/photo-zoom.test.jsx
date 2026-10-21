import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotographyGallery } from "../../../src/features/photography/PhotographyGallery";

const fixture = [
  {
    id: "street-1",
    src: "/a.webp",
    title: "Rickshaw at dusk",
    category: "Street",
    alt: "Street photography by Jahid Hasan",
  },
  {
    id: "nature-1",
    src: "/b.webp",
    title: null,
    category: "Nature",
    alt: "Nature photography by Jahid Hasan",
  },
];

// A stand-in for the View Transitions API: records which element holds
// the zoom name before and after the update, like the browser's snapshots.
function installViewTransitions() {
  const snapshots = [];
  const named = () =>
    [...document.querySelectorAll("[style]")]
      .filter((el) => el.style.viewTransitionName === "photo-zoom")
      .map((el) => el.dataset.photoId ?? "viewer");
  document.startViewTransition = vi.fn((update) => {
    const record = { before: named(), after: null };
    snapshots.push(record);
    const done = Promise.resolve(update()).then(() => {
      record.after = named();
    });
    return { finished: done, ready: done, updateCallbackDone: done };
  });
  return snapshots;
}

afterEach(() => {
  delete document.startViewTransition;
});

describe("contact-sheet frames", () => {
  it("print the frame number and caption, falling back to the album", () => {
    render(<PhotographyGallery photographs={fixture} />);
    const [first, second] = screen.getAllByRole("listitem");
    expect(first).toHaveTextContent("01▸Rickshaw at dusk");
    expect(second).toHaveTextContent("02▸Nature");
  });
});

describe("photo zoom", () => {
  it("zooms from the frame into the viewer and back", async () => {
    const snapshots = installViewTransitions();
    const user = userEvent.setup();
    render(<PhotographyGallery photographs={fixture} />);

    const frame = within(screen.getAllByRole("listitem")[0]).getByRole(
      "button",
    );
    await user.click(frame);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await waitFor(() => expect(snapshots[0].after).not.toBeNull());
    expect(snapshots[0]).toEqual({ before: ["street-1"], after: ["viewer"] });

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(snapshots[1].after).not.toBeNull());
    expect(snapshots[1].before).toEqual(["viewer"]);
    // jsdom has no layout, so the frame counts as off screen: the viewer
    // just fades instead of zooming into it.
    expect(snapshots[1].after).toEqual([]);
    expect(frame).toHaveFocus();
  });

  it("falls back to the fade without view transitions", async () => {
    const user = userEvent.setup();
    render(<PhotographyGallery photographs={fixture} />);
    await user.click(
      within(screen.getAllByRole("listitem")[0]).getByRole("button"),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      document.querySelector("[data-photo-viewer]").style.viewTransitionName,
    ).toBe("");
  });
});
