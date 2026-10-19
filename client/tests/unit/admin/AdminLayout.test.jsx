import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdminLayout", () => {
  it("offers GitHub sign-in when signed out", async () => {
    installFakeAdminApi({ signedIn: false });
    renderAdmin();

    const link = await screen.findByRole("link", {
      name: /sign in with github/i,
    });
    expect(link.getAttribute("href")).toMatch(/\/api\/auth\/github$/);
  });

  it("explains a rejected account", async () => {
    installFakeAdminApi({ signedIn: false });
    renderAdmin("/admin?error=not-allowed");

    expect(
      await screen.findByText(/isn't allowed to manage this site/i),
    ).toBeInTheDocument();
  });

  it("reports an unreachable admin service", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    renderAdmin();

    expect(await screen.findByText(/isn't reachable/i)).toBeInTheDocument();
  });

  it("shows the overview with section counts once signed in", async () => {
    installFakeAdminApi();
    renderAdmin();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Welcome, @jahidjubaer",
      }),
    ).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Admin sections" });
    for (const label of [
      "Overview",
      "Profile & hero",
      "Projects",
      "Experience",
      "Skills",
      "Certifications",
      "Beyond",
    ]) {
      expect(
        within(nav).getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole("link", { name: /certifications 4/i }),
    ).toBeInTheDocument();
  });

  it("signs out", async () => {
    installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole("button", { name: /sign out/i }));
    expect(
      await screen.findByRole("link", { name: /sign in with github/i }),
    ).toBeInTheDocument();
  });
});
