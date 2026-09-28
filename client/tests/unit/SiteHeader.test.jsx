import { describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SiteHeader } from "../../src/components/navigation/SiteHeader";

const PRIMARY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
];

const SECONDARY_LINKS = [
  { label: "Learning", href: "/learning" },
  { label: "Beyond", href: "/beyond" },
  { label: "Résumé", href: "/resume" },
];

describe("SiteHeader", () => {
  it("renders the primary links, the Contact action, and the rest behind More", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const { label, href } of PRIMARY_LINKS) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }

    // Contact stays reachable as the header's standalone action button.
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );

    // Secondary routes are behind the More disclosure, not lost.
    const moreButton = within(nav).getByRole("button", { name: "More" });
    expect(moreButton).toHaveAttribute("aria-expanded", "false");
    for (const { label } of SECONDARY_LINKS) {
      expect(
        within(nav).queryByRole("link", { name: label }),
      ).not.toBeInTheDocument();
    }

    await user.click(moreButton);

    expect(moreButton).toHaveAttribute("aria-expanded", "true");
    for (const { label, href } of SECONDARY_LINKS) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  it("closes the More disclosure with Escape and returns focus to its trigger", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const moreButton = within(nav).getByRole("button", { name: "More" });
    await user.click(moreButton);
    expect(within(nav).getByRole("link", { name: "Beyond" })).toBeVisible();

    await user.keyboard("{Escape}");

    expect(moreButton).toHaveAttribute("aria-expanded", "false");
    expect(
      within(nav).queryByRole("link", { name: "Beyond" }),
    ).not.toBeInTheDocument();
    expect(moreButton).toHaveFocus();
  });

  it("opens and closes the mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(
      screen.getByRole("navigation", { name: "Mobile" }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    // The panel has an exit animation (Motion AnimatePresence), so it is
    // removed from the DOM asynchronously rather than on the same tick.
    await waitFor(() => {
      expect(
        screen.queryByRole("navigation", { name: "Mobile" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
