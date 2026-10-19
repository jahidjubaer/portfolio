import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { capabilityGroups } from "../../../src/data/capabilities";
import snapshot from "../../../src/generated/content.json";
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
    await user.type(screen.getByLabelText("Name"), "Team Leadership");
    await user.selectOptions(
      screen.getByLabelText("Issuing organization"),
      "Wadhwani Foundation",
    );
    await user.selectOptions(screen.getByLabelText("Type"), "course");
    await user.type(screen.getByLabelText(/Issue date/), "2025-03");
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
        organizationId: "wadhwani-foundation",
        kind: "course",
        status: "completed",
        issued: "2025-03",
        skills: [],
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
    renderAdmin("/admin/skills");
    const [first, second] = capabilityGroups;

    await user.click(
      await screen.findByRole("button", { name: `Move “${second.title}” up` }),
    );
    expect(await screen.findByText("Order saved.")).toBeInTheDocument();
    expect(lastWrite(api).body.keys.slice(0, 2)).toEqual([second.id, first.id]);

    await user.click(
      screen.getByRole("button", { name: `Delete “${second.title}”` }),
    );
    const row = screen.getByText("Delete?").closest("li");
    await user.click(within(row).getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText(`Deleted “${second.title}”.`),
    ).toBeInTheDocument();
    expect(lastWrite(api)).toMatchObject({
      method: "DELETE",
      path: `/admin/lists/skills/${second.id}`,
    });
  });

  it("edits an organization's roles in one experience entry", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/experience/metropolitan-university-sports-club");

    const roles = await screen.findByRole("group", { name: "Roles" });
    const existing = snapshot.experience.find(
      (entry) => entry.id === "metropolitan-university-sports-club",
    ).roles.length;
    expect(within(roles).getAllByLabelText("Title")).toHaveLength(existing);
    await user.click(within(roles).getByRole("button", { name: "Add role" }));
    const titles = within(roles).getAllByLabelText("Title");
    await user.type(titles[existing], "President");
    await user.type(
      within(roles).getAllByLabelText(/^Start/)[existing],
      "2025-06",
    );
    await user.click(
      within(roles).getAllByLabelText(/I currently hold this role/)[existing],
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(lastWrite(api)).toMatchObject({
        method: "PUT",
        path: "/admin/lists/experience/metropolitan-university-sports-club",
      }),
    );
    const saved = lastWrite(api).body.roles;
    expect(saved).toHaveLength(existing + 1);
    expect(saved[existing]).toEqual({
      title: "President",
      start: "2025-06",
      current: true,
      skills: [],
    });
    // An unticked "current" box is left out, not saved as false.
    expect(saved[0]).not.toHaveProperty("current");
  });

  it("links certifications and projects to a learning track", async () => {
    const api = installFakeAdminApi({ withProjects: true });
    const user = userEvent.setup();
    renderAdmin("/admin/learningTracks/new");

    await user.type(await screen.findByLabelText("ID"), "react");
    await user.type(screen.getByLabelText("Topic"), "Advanced React");
    await user.click(
      screen.getByRole("checkbox", { name: "Reactive Accelerator" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Sarabo" }));
    await user.click(screen.getByRole("button", { name: "Add track" }));

    await waitFor(() =>
      expect(lastWrite(api)).toMatchObject({
        method: "POST",
        path: "/admin/lists/learningTracks",
        body: {
          id: "react",
          title: "Advanced React",
          status: "learning",
          certificationIds: ["learn-with-sumit-reactive-accelerator"],
          projectSlugs: ["sarabo"],
        },
      }),
    );
  });

  it("asks before leaving with unsaved changes", async () => {
    installFakeAdminApi();
    const user = userEvent.setup();
    const router = renderAdmin("/admin/profile");

    await user.type(await screen.findByLabelText("Location"), " (edited)");
    await user.click(screen.getByRole("link", { name: /^Skills/ }));

    const dialog = await screen.findByRole("alertdialog", {
      name: "Leave without saving?",
    });
    await user.click(within(dialog).getByRole("button", { name: "Stay" }));
    expect(router.state.location.pathname).toBe("/admin/profile");

    await user.click(screen.getByRole("link", { name: /^Skills/ }));
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
