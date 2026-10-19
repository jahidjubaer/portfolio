import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin publishing", { timeout: 20_000 }, () => {
  it("publishes and clears the unpublished-changes mark", async () => {
    const api = installFakeAdminApi({
      publishing: {
        lastEditAt: "2026-10-19T07:00:00Z",
        lastPublishAt: "2026-10-18T07:00:00Z",
        hasUnpublishedChanges: true,
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin");

    const button = await screen.findByRole("button", {
      name: "Publish (unpublished changes)",
    });
    const panel = await screen.findByRole("region", { name: "Publishing" });
    expect(within(panel).getByText(/You have changes since/)).toBeVisible();

    await user.click(button);
    expect(
      await screen.findByText(
        "Publishing — the site updates in about 2 minutes.",
      ),
    ).toBeVisible();
    expect(
      api.requests.some(
        (request) =>
          request.method === "POST" && request.path === "/admin/publish",
      ),
    ).toBe(true);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Publish" }),
      ).toBeInTheDocument(),
    );
    expect(within(panel).getByText(/Everything is published/)).toBeVisible();
  });

  it("explains why publishing failed", async () => {
    installFakeAdminApi({
      publishing: { configured: false },
      publishResult: {
        status: 503,
        body: {
          success: false,
          error: "Publishing isn't configured (no VERCEL_DEPLOY_HOOK_URL).",
        },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin");

    const panel = await screen.findByRole("region", { name: "Publishing" });
    expect(
      within(panel).getByText(/Publishing isn't set up yet/),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Publish" }));
    expect(
      await screen.findByText(
        "Publishing isn't configured (no VERCEL_DEPLOY_HOOK_URL).",
      ),
    ).toBeVisible();
  });
});
