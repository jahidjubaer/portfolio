import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";
import snapshot from "../../../src/generated/content.json";
import {
  getAttentionItems,
  needsMigration,
  sectionCount,
} from "../../../src/features/admin/attention";

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastWrite(api) {
  return api.requests.filter((request) => request.method !== "GET").at(-1);
}

// A copy of a real certificate under a new id, to exercise the check.
const duplicateCertificate = {
  ...snapshot.certifications.find((item) => item.id === "kaggle-python"),
  id: "kaggle-python-copy",
};

describe("getAttentionItems", () => {
  const content = {
    ...structuredClone(snapshot),
    certifications: [...snapshot.certifications, duplicateCertificate],
    learningTracks: [],
    repositories: { warnings: [] },
  };

  it("flags missing logos and the duplicate certificate", () => {
    const items = getAttentionItems(content);
    const ids = items.map((item) => item.id);
    expect(ids).toContain("logos");
    const missing = snapshot.organizations.filter((item) => !item.logo).length;
    expect(items.find((item) => item.id === "logos").message).toMatch(
      new RegExp(
        missing === 1
          ? "1 organization has no logo"
          : `${missing} organizations have no logo`,
      ),
    );
    const duplicate = items.find((item) => item.id.startsWith("duplicate-"));
    expect(duplicate.tone).toBe("fix");
    expect(duplicate.message).toMatch(/“Python” looks like a duplicate/);
  });

  it("suggests months, credential links, and a first learning track", () => {
    const ids = getAttentionItems(content).map((item) => item.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "role-months",
        "credential-links",
        "learning-tracks",
        "organization-links",
      ]),
    );
  });

  it("says nothing until the database is migrated", () => {
    const legacy = {
      ...content,
      experience: [{ id: "old", title: "Volunteer", organization: "RCY" }],
    };
    expect(needsMigration(legacy)).toBe(true);
    expect(getAttentionItems(legacy)).toEqual([]);
  });

  it("counts list sections, not single documents", () => {
    expect(sectionCount("organizations", content)).toBe(
      snapshot.organizations.length,
    );
    expect(sectionCount("profile", content)).toBeNull();
  });
});

describe("admin overview and editors", () => {
  it("lists what needs attention, linked to where it's fixed", async () => {
    installFakeAdminApi({
      overrides: {
        certifications: [...snapshot.certifications, duplicateCertificate],
      },
    });
    renderAdmin("/admin");
    const section = (
      await screen.findByRole("heading", { name: "Needs attention" })
    ).closest("section");
    const link = within(section).getByRole("link", {
      name: /looks like a duplicate/,
    });
    expect(link).toHaveAttribute("href", "/admin/certifications");
  });

  it("warns when the database still needs its migration", async () => {
    installFakeAdminApi({
      overrides: {
        experience: [{ id: "old", title: "Volunteer", organization: "RCY" }],
      },
    });
    renderAdmin("/admin");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "npm run migrate -w server",
    );
  });

  it("previews an experience entry as the site shows it", async () => {
    const user = userEvent.setup();
    installFakeAdminApi();
    renderAdmin("/admin/experience/metropolitan-university-sports-club");

    const preview = await screen.findByRole("complementary", {
      name: /Preview/,
    });
    expect(
      within(preview).getByRole("heading", {
        level: 3,
        name: /Metropolitan University Sports Club/,
      }),
    ).toBeInTheDocument();

    const roles = screen.getByRole("group", { name: "Roles" });
    const [title] = within(roles).getAllByLabelText("Title");
    await user.clear(title);
    await user.type(title, "General Secretary");
    expect(
      within(preview).getByRole("heading", { name: "General Secretary" }),
    ).toBeInTheDocument();
  });

  it("adds an organization from the picker and selects it", async () => {
    const user = userEvent.setup();
    const api = installFakeAdminApi();
    renderAdmin("/admin/education/new");

    await user.click(
      await screen.findByRole("button", { name: "New organization" }),
    );
    await user.type(
      screen.getByLabelText("New organization's name"),
      "Sylhet Govt. College{Enter}",
    );

    await waitFor(() =>
      expect(screen.getByLabelText("School")).toHaveValue(
        "sylhet-govt-college",
      ),
    );
    expect(lastWrite(api)).toMatchObject({
      method: "POST",
      path: "/admin/lists/organizations",
      body: { id: "sylhet-govt-college", name: "Sylhet Govt. College" },
    });
    // Enter added the organization; it didn't submit the education form.
    expect(
      api.requests.some((request) => request.path === "/admin/lists/education"),
    ).toBe(false);
  });

  it("saves with Ctrl+S", async () => {
    const user = userEvent.setup();
    const api = installFakeAdminApi();
    renderAdmin("/admin/organizations/programming-hero");

    await user.type(await screen.findByLabelText(/^Location/), "Dhaka");
    await user.keyboard("{Control>}s{/Control}");

    await waitFor(() =>
      expect(lastWrite(api)).toMatchObject({
        method: "PUT",
        path: "/admin/lists/organizations/programming-hero",
        body: { location: "Dhaka" },
      }),
    );
  });

  it("edits site settings", async () => {
    const user = userEvent.setup();
    const api = installFakeAdminApi({
      overrides: { settings: structuredClone(snapshot.settings) },
    });
    renderAdmin("/admin/settings");

    await user.click(
      await screen.findByLabelText(/Show the "Open to new roles" badge/),
    );
    await user.click(screen.getByRole("button", { name: "Move Skills up" }));
    await user.selectOptions(screen.getByLabelText("Style"), "split");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(lastWrite(api)).toMatchObject({
        method: "PUT",
        path: "/admin/singletons/settings",
      }),
    );
    const saved = lastWrite(api).body;
    expect(saved.openToWorkBadge).toBe(false);
    expect(saved.intro.style).toBe("split");
    const ids = saved.profileSections.map((section) => section.id);
    expect(ids.indexOf("skills")).toBeLessThan(ids.indexOf("certifications"));
    // Headings in the form are layout, not data.
    expect(saved).not.toHaveProperty("appearanceHeading");
  });

  it("links an item to its place on the site", async () => {
    installFakeAdminApi();
    renderAdmin("/admin/certifications/edge-python-data-science");
    expect(
      await screen.findByRole("link", { name: /View on site/ }),
    ).toHaveAttribute("href", "/credentials#certifications");
  });

  it("searches long lists", async () => {
    const user = userEvent.setup();
    installFakeAdminApi();
    renderAdmin("/admin/organizations");

    await user.type(
      await screen.findByRole("searchbox", { name: "Search organizations" }),
      "sumit",
    );
    expect(screen.getAllByRole("link", { name: /^Edit/ })).toHaveLength(1);
    // A filtered list can't be reordered.
    expect(screen.queryByRole("button", { name: /^Move/ })).toBeNull();
  });
});
