import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CommandPalette } from "../../src/features/command-palette/CommandPalette";
import { profile } from "../../src/data/profile";

function renderPalette() {
  return render(
    <MemoryRouter>
      <button type="button">Trigger outside</button>
      <input aria-label="Unrelated form field" />
      <CommandPalette />
    </MemoryRouter>,
  );
}

async function openWithCtrlK(user) {
  await user.keyboard("{Control>}k{/Control}");
  // The dialog is behind a React.lazy() dynamic import (see
  // CommandPalette.jsx) so it can be fetched only on first use rather than
  // inflating the initial bundle — under a busy full-suite run that first
  // fetch can take longer than Testing Library's 1000ms default.
  await screen.findByRole(
    "dialog",
    { name: "Command palette" },
    { timeout: 5000 },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CommandPalette", () => {
  it("opens with Ctrl+K", async () => {
    const user = userEvent.setup();
    renderPalette();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await openWithCtrlK(user);
    expect(
      screen.getByRole("dialog", { name: "Command palette" }),
    ).toBeInTheDocument();
  });

  it("opens with Cmd+K (metaKey)", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.keyboard("{Meta>}k{/Meta}");
    expect(
      await screen.findByRole(
        "dialog",
        { name: "Command palette" },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it("moves focus into the search input when opened", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);
    expect(
      screen.getByRole("combobox", { name: "Search commands" }),
    ).toHaveFocus();
  });

  it("closes on Escape and returns focus to the previously focused element", async () => {
    const user = userEvent.setup();
    renderPalette();

    const trigger = screen.getByRole("button", { name: "Trigger outside" });
    trigger.focus();
    await openWithCtrlK(user);

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("does not intercept Ctrl+K while typing in an unrelated form field", async () => {
    const user = userEvent.setup();
    renderPalette();

    const field = screen.getByRole("textbox", { name: "Unrelated form field" });
    await user.click(field);
    await user.keyboard("{Control>}k{/Control}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters commands as the query changes", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);
    expect(screen.getByRole("option", { name: /home/i })).toBeInTheDocument();

    await user.type(
      screen.getByRole("combobox", { name: "Search commands" }),
      "learning",
    );

    expect(
      screen.getByRole("option", { name: /learning/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /^home$/i }),
    ).not.toBeInTheDocument();
  });

  it("finds 'Résumé' when searching the unaccented 'resume'", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);
    await user.type(
      screen.getByRole("combobox", { name: "Search commands" }),
      "resume",
    );

    expect(
      screen.getByRole("option", { name: /^résumé$/i }),
    ).toBeInTheDocument();
  });

  it("shows an honest empty state for a query matching nothing", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);
    await user.type(
      screen.getByRole("combobox", { name: "Search commands" }),
      "zzz-nonexistent",
    );

    expect(screen.getByText("No matching commands.")).toBeInTheDocument();
  });

  it("moves the highlighted command with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);
    const input = screen.getByRole("combobox", { name: "Search commands" });
    const firstOption = screen.getByRole("option", { name: /home/i });
    const secondOption = screen.getByRole("option", { name: /work/i });

    expect(firstOption).toHaveAttribute("aria-selected", "true");

    await user.type(input, "{ArrowDown}");
    expect(secondOption).toHaveAttribute("aria-selected", "true");
    expect(firstOption).toHaveAttribute("aria-selected", "false");

    await user.type(input, "{ArrowUp}");
    expect(firstOption).toHaveAttribute("aria-selected", "true");
  });

  it("navigates and closes when Enter executes a navigation command", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);
    await user.type(
      screen.getByRole("combobox", { name: "Search commands" }),
      "About",
    );
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens an external command in a new tab and closes the palette", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    renderPalette();

    await openWithCtrlK(user);
    const githubOption = await screen.findByRole("option", { name: /github/i });
    await user.click(githubOption.querySelector("button"));

    expect(openSpy).toHaveBeenCalledWith(
      profile.github,
      "_blank",
      "noopener,noreferrer",
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("includes a résumé download command when a résumé is available", async () => {
    const user = userEvent.setup();
    renderPalette();

    await openWithCtrlK(user);

    if (profile.resume.available) {
      expect(
        screen.getByRole("option", { name: /download résumé/i }),
      ).toBeInTheDocument();
    } else {
      expect(
        screen.queryByRole("option", { name: /download résumé/i }),
      ).not.toBeInTheDocument();
    }
  });
});
