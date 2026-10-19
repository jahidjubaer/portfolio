import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastWrite(api) {
  return api.requests.filter((request) => request.method !== "GET").at(-1);
}

// Typing-heavy flows; give them room when the whole suite runs in parallel.
describe("admin editors", { timeout: 15_000 }, () => {
  it("edits the profile and saves only valid input", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/profile");

    const headline = await screen.findByLabelText("Headline");
    await user.clear(headline);
    await user.type(headline, "Building calm, accessible interfaces.");

    const email = screen.getByLabelText("Email");
    await user.clear(email);
    await user.type(email, "not-an-email");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(email).toHaveFocus());
    expect(lastWrite(api)).toBeUndefined();

    await user.clear(email);
    await user.type(email, "jahid@example.com");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    expect(lastWrite(api)).toMatchObject({
      method: "PUT",
      path: "/admin/singletons/profile",
      body: {
        heroHeadline: "Building calm, accessible interfaces.",
        email: "jahid@example.com",
      },
    });
  });

  it("turns one-per-line text back into a list", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/profile");

    const roles = await screen.findByLabelText("Open to (roles)");
    await user.clear(roles);
    await user.type(roles, "Frontend Developer{Enter}{Enter}  MTO  {Enter}");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByText("Saved.");
    expect(lastWrite(api).body.targetRoles).toEqual([
      "Frontend Developer",
      "MTO",
    ]);
  });

  it("adds a certification and opens it for editing", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    const router = renderAdmin("/admin/certifications/new");

    await user.type(await screen.findByLabelText("ID"), "team-lead");
    await user.type(screen.getByLabelText("Title"), "Team Leadership");
    await user.type(screen.getByLabelText("Issued by"), "Example Org");
    await user.selectOptions(screen.getByLabelText("Group"), "leadership");
    await user.type(screen.getByLabelText(/Issued \(year/), "2025");
    await user.click(screen.getByRole("button", { name: "Add certification" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        "/admin/certifications/team-lead",
      ),
    );
    expect(lastWrite(api)).toMatchObject({
      method: "POST",
      path: "/admin/lists/certifications",
      body: {
        id: "team-lead",
        category: "leadership",
        status: "completed",
        issued: "2025",
      },
    });
    // Optional fields left blank are omitted, not sent as "".
    expect(lastWrite(api).body).not.toHaveProperty("credentialUrl");
  });

  it("keeps the ID fixed when editing", async () => {
    installFakeAdminApi();
    renderAdmin("/admin/certifications/edge-python-data-science");

    expect(await screen.findByLabelText("ID")).toHaveAttribute("readonly");
  });

  it("reorders and deletes list items", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/certifications");

    await user.click(
      await screen.findByRole("button", {
        name: "Move “Reactive Accelerator” up",
      }),
    );
    expect(await screen.findByText("Order saved.")).toBeInTheDocument();
    expect(lastWrite(api).body.keys.slice(0, 2)).toEqual([
      "learn-with-sumit-reactive-accelerator",
      "programming-hero-complete-web-development",
    ]);

    await user.click(
      screen.getByRole("button", { name: "Delete “Reactive Accelerator”" }),
    );
    const row = screen.getByText("Delete?").closest("li");
    await user.click(within(row).getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText("Deleted “Reactive Accelerator”."),
    ).toBeInTheDocument();
    expect(lastWrite(api)).toMatchObject({
      method: "DELETE",
      path: "/admin/lists/certifications/learn-with-sumit-reactive-accelerator",
    });
  });

  it("asks before leaving with unsaved changes", async () => {
    installFakeAdminApi();
    const user = userEvent.setup();
    const router = renderAdmin("/admin/profile");

    await user.type(await screen.findByLabelText("Location"), " (edited)");
    await user.click(screen.getByRole("link", { name: "Skills" }));

    const dialog = await screen.findByRole("alertdialog", {
      name: "Leave without saving?",
    });
    await user.click(within(dialog).getByRole("button", { name: "Stay" }));
    expect(router.state.location.pathname).toBe("/admin/profile");

    await user.click(screen.getByRole("link", { name: "Skills" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Leave",
      }),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/admin/skills"),
    );
  });
});
