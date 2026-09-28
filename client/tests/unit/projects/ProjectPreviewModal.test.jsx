import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { FeaturedProjectDossier } from "../../../src/features/projects/FeaturedProjectDossier";

const liveProject = {
  slug: "sarabo",
  title: "Sarabo",
  summary: "A multi-role electronics-repair service platform.",
  status: "live",
  caseStudyStatus: "complete",
  stack: ["React", "Node.js"],
  links: [
    { label: "Live client", url: "https://sarabo-jahid.web.app", type: "live" },
  ],
};

const staticProject = {
  ...liveProject,
  slug: "bangladesh-landscape",
  title: "Bangladesh Landscape",
  links: [
    {
      label: "Client repository",
      url: "https://github.com/jahidjubaer/bangladesh-landscape-client",
      type: "repository",
    },
  ],
};

function renderDossier(project = liveProject) {
  render(
    <MemoryRouter>
      <FeaturedProjectDossier project={project} index={1} />
    </MemoryRouter>,
  );
}

// The modal is lazy-loaded, so every test awaits the dialog role after
// triggering it open.
async function openPreview(user) {
  await user.click(screen.getByRole("button", { name: "Preview" }));
  return await screen.findByRole("dialog");
}

describe("ProjectPreviewModal", () => {
  it("opens as a labelled modal dialog with focus moved inside", async () => {
    const user = userEvent.setup();
    renderDossier();

    const dialog = await openPreview(user);

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Sarabo — Live Preview");
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("closes with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderDossier();

    const trigger = screen.getByRole("button", { name: "Preview" });
    await openPreview(user);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes from its named close button", async () => {
    const user = userEvent.setup();
    renderDossier();
    await openPreview(user);

    await user.click(screen.getByRole("button", { name: "Close preview" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is also openable from the keyboard-focusable cover button", async () => {
    const user = userEvent.setup();
    renderDossier();

    const coverTrigger = screen.getByRole("button", {
      name: "Open Sarabo preview",
    });
    coverTrigger.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("embeds the live site in a sandboxed iframe with viewport controls", async () => {
    const user = userEvent.setup();
    renderDossier();
    const dialog = await openPreview(user);

    const iframe = dialog.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://sarabo-jahid.web.app");
    expect(iframe).toHaveAttribute("sandbox");
    expect(
      screen.getByRole("group", { name: "Preview viewport width" }),
    ).toBeInTheDocument();
  });

  it("presents an honest static snapshot when the project has no live URL", async () => {
    const user = userEvent.setup();
    renderDossier(staticProject);

    const dialog = await openPreview(user);

    expect(dialog).toHaveAccessibleName(
      "Bangladesh Landscape — Project Snapshot",
    );
    expect(dialog.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByText(/static snapshot/i)).toBeInTheDocument();
    expect(screen.getByText("Static")).toBeInTheDocument();
  });
});
