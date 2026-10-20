import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastWrite(api, path) {
  return api.requests.filter(
    (request) => request.method !== "GET" && (!path || request.path === path),
  );
}

const REPOS = {
  sync: {
    syncedAt: "2026-10-19T06:00:00Z",
    lastAttemptAt: "2026-10-19T06:00:00Z",
    repoCount: 2,
    error: null,
  },
  repos: [
    {
      id: 1,
      name: "Programming",
      url: "https://github.com/jahidjubaer/Programming",
      description: "C++ solutions",
      language: "C++",
      topics: [],
      homepage: null,
      stars: 0,
      fork: false,
      archived: false,
      pushedAt: "2025-07-05T17:13:18Z",
      projects: [],
    },
    {
      id: 2,
      name: "sarabo-client",
      url: "https://github.com/jahidjubaer/sarabo-client",
      description: null,
      language: "JavaScript",
      topics: [],
      homepage: null,
      stars: 0,
      fork: false,
      archived: false,
      pushedAt: "2026-10-18T09:00:00Z",
      projects: [],
    },
  ],
};

const MESSAGE = {
  id: "m1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Job opportunity",
  message: "We'd like to talk.",
  receivedAt: "2026-10-20T10:00:00Z",
  read: false,
  archived: false,
};

describe("admin: messages", { timeout: 20_000 }, () => {
  it("shows unread messages on the overview and in the inbox", async () => {
    installFakeAdminApi({ overrides: { messages: [MESSAGE] } });
    renderAdmin("/admin");
    const banner = await screen.findByRole("link", {
      name: /1 new message from the contact form/,
    });
    expect(banner).toHaveAttribute("href", "/admin/messages");
  });

  it("marks read, archives, and deletes after confirming", async () => {
    const api = installFakeAdminApi({
      overrides: { messages: [{ ...MESSAGE }] },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/messages");

    const card = (await screen.findByText("We'd like to talk.")).closest(
      "article",
    );
    expect(within(card).getByRole("link", { name: "Reply" })).toHaveAttribute(
      "href",
      "mailto:ada@example.com?subject=Re%3A%20Job%20opportunity",
    );
    await user.click(within(card).getByRole("button", { name: "Mark read" }));
    await waitFor(() =>
      expect(lastWrite(api, "/admin/messages/m1").at(-1)).toMatchObject({
        method: "PATCH",
        body: { read: true },
      }),
    );

    await user.click(await screen.findByRole("button", { name: "Archive" }));
    expect(await screen.findByText("No messages yet.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Archived \(1\)/ }));
    await user.click(
      await screen.findByRole("button", {
        name: "Delete the message from Ada Lovelace",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Delete for good" }));
    expect(await screen.findByText("Nothing archived.")).toBeVisible();
    expect(lastWrite(api, "/admin/messages/m1").at(-1).method).toBe("DELETE");
  });
});

describe("admin: changes since last publish", { timeout: 20_000 }, () => {
  it("lists each unpublished change with a link to it", async () => {
    installFakeAdminApi({
      publishing: {
        hasUnpublishedChanges: true,
        lastEditAt: "2026-10-20T10:00:00Z",
        changes: [
          {
            collection: "certifications",
            key: "photography-basics",
            label: "Photography Basics",
            action: "created",
            count: 1,
          },
          { collection: "profile", action: "updated", count: 3 },
        ],
      },
    });
    renderAdmin("/admin");
    const heading = await screen.findByRole("heading", {
      name: "Not published yet (2)",
    });
    const list = heading.parentElement;
    expect(
      within(list).getByRole("link", { name: "Photography Basics" }),
    ).toHaveAttribute("href", "/admin/certifications/photography-basics");
    expect(
      within(list).getByRole("link", { name: "Profile & hero" }),
    ).toHaveAttribute("href", "/admin/profile");
    expect(list).toHaveTextContent("saved 3 times");
  });
});

describe("admin: coding stats and learning tracks", { timeout: 20_000 }, () => {
  it("syncs coding stats from the repos page", async () => {
    const api = installFakeAdminApi({
      repositories: REPOS,
      codingSyncResult: {
        status: 200,
        body: {
          success: true,
          data: {
            errors: { codeforces: "Codeforces answered 503." },
            vjudge: {
              handle: "jahidjubaer01",
              solved: 207,
              byJudge: [{ judge: "Gym", solved: 87 }],
            },
            judges: [
              { judge: "Gym", solved: 87, direct: 0, vjudge: 87, overlap: 0 },
              {
                judge: "CodeForces",
                solved: 54,
                direct: 21,
                vjudge: 47,
                overlap: 14,
              },
            ],
            total: 141,
          },
        },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/repositories");
    await user.click(
      await screen.findByRole("button", { name: "Sync coding stats" }),
    );
    expect(
      await screen.findByText("Synced, but 1 source(s) failed."),
    ).toBeVisible();
    expect(
      await screen.findByText(/@jahidjubaer01 · 207 solved on 1 judges/),
    ).toBeVisible();
    expect(
      screen.getByText("Last sync failed: Codeforces answered 503."),
    ).toBeVisible();
    const merge = screen.getByRole("table", { name: /141 distinct problems/ });
    expect(merge).toHaveAccessibleName(
      /14 solved on both VJudge and Codeforces/,
    );
    expect(
      within(merge).getByRole("row", { name: /Codeforces Gym/ }),
    ).toHaveTextContent("Codeforces Gym—87—87");
    expect(lastWrite(api, "/admin/coding/sync")).toHaveLength(1);
  });

  it("starts a learning track connected to a repo", async () => {
    const api = installFakeAdminApi({ repositories: REPOS });
    const user = userEvent.setup();
    const router = renderAdmin("/admin/repositories");
    await user.click(
      await screen.findByRole("button", {
        name: "Add Programming as a learning track",
      }),
    );
    expect(router.state.location.pathname).toBe("/admin/learningTracks/new");
    expect(await screen.findByLabelText("Topic")).toHaveValue("Programming");
    expect(screen.getByRole("checkbox", { name: "Programming" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Add track" }));
    await waitFor(() =>
      expect(
        lastWrite(api, "/admin/lists/learningTracks").at(-1),
      ).toMatchObject({
        method: "POST",
        body: {
          id: "programming",
          title: "Programming",
          repos: ["Programming"],
        },
      }),
    );
  });
});

describe("admin: draft with AI", { timeout: 20_000 }, () => {
  it("explains when AI isn't configured", async () => {
    installFakeAdminApi({ repositories: REPOS });
    renderAdmin("/admin/projects/new");
    expect(
      await screen.findByText(/Not configured on this server/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Draft from repo" }),
    ).toBeDisabled();
  });

  it("fills the project form from the draft without saving", async () => {
    const api = installFakeAdminApi({
      repositories: REPOS,
      overrides: { aiConfigured: true },
      aiDraftResult: {
        status: 200,
        body: {
          success: true,
          data: {
            title: "Sarabo",
            summary: "A service booking app.",
            projectType: "Full-stack web app",
            stack: ["React", "Express"],
            capabilities: ["Booking"],
            caseStudy: null,
            seo: { title: "Sarabo", description: "Booking app." },
            missingContent: ["Add screenshots of the dashboard"],
          },
        },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/projects/new");
    const select = await screen.findByLabelText("Repository");
    await user.selectOptions(select, "sarabo-client");
    await user.click(screen.getByRole("button", { name: "Draft from repo" }));

    expect(await screen.findByLabelText("Title")).toHaveValue("Sarabo");
    expect(screen.getByLabelText("Summary")).toHaveValue(
      "A service booking app.",
    );
    const panel = screen
      .getByRole("heading", { name: "Draft with AI" })
      .closest("section");
    expect(
      within(panel).getByText("Add screenshots of the dashboard"),
    ).toBeVisible();
    expect(lastWrite(api, "/admin/ai/project-draft").at(-1).body).toEqual({
      repos: ["sarabo-client"],
    });
    // Nothing saved yet.
    expect(
      api.requests.some(
        (request) =>
          request.method === "POST" && request.path === "/admin/lists/projects",
      ),
    ).toBe(false);
  });

  it("drafts a project from all of its linked repos at once", async () => {
    const api = installFakeAdminApi({
      repositories: REPOS,
      withProjects: true,
      overrides: { aiConfigured: true },
      aiDraftResult: {
        status: 200,
        body: {
          success: true,
          data: {
            title: "Sarabo",
            summary: "A booking app.",
            projectType: "Full-stack web app",
            stack: ["React"],
            capabilities: [],
            caseStudy: null,
            seo: { title: "Sarabo", description: "Booking." },
            missingContent: [],
          },
        },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/projects/sarabo");
    const panel = (
      await screen.findByRole("heading", { name: "Draft with AI" })
    ).closest("section");
    const client = within(panel).getByRole("checkbox", {
      name: "sarabo-client",
    });
    expect(client).toBeChecked();
    expect(
      within(panel).getByRole("checkbox", { name: "sarabo-server" }),
    ).toBeChecked();
    await user.click(
      within(panel).getByRole("button", { name: "Draft from 2 repos" }),
    );
    await waitFor(() =>
      expect(lastWrite(api, "/admin/ai/project-draft").at(-1).body).toEqual({
        repos: ["sarabo-client", "sarabo-server"],
      }),
    );

    await user.click(client);
    expect(
      within(panel).getByRole("button", { name: "Draft from repo" }),
    ).toBeEnabled();
  });

  it("shows the server's error", async () => {
    installFakeAdminApi({
      repositories: REPOS,
      overrides: { aiConfigured: true },
      aiDraftResult: {
        status: 429,
        body: { success: false, error: "The free credit is used up." },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/learningTracks/new");
    await user.click(
      await screen.findByRole("button", { name: "Draft from repo" }),
    );
    expect(
      await screen.findByText("The free credit is used up."),
    ).toBeVisible();
  });
});

describe("admin: LinkedIn import", { timeout: 20_000 }, () => {
  const CERTS = [
    "Name,Url,Authority,Started On,Finished On,License Number",
    "Accessibility Fundamentals,,Example Academy,2020,,",
    "Pandas,,Kaggle,Apr 2025,,",
  ].join("\n");

  it("adds only the new items, with the organizations they need", async () => {
    const api = installFakeAdminApi();
    const user = userEvent.setup();
    renderAdmin("/admin/linkedin-import");
    const input = await screen.findByLabelText("Choose CSV files");
    const certs = new File([CERTS], "Certifications.csv", { type: "text/csv" });
    const private_ = new File(["First Name,Phone"], "PhoneNumbers.csv", {
      type: "text/csv",
    });
    fireEvent.change(input, { target: { files: [certs, private_] } });

    expect(await screen.findByText("Read: Certifications.csv")).toBeVisible();
    const fresh = screen.getByRole("checkbox", {
      name: /Accessibility Fundamentals/,
    });
    expect(fresh).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Pandas/ })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Add 1 items" }));
    expect(
      await screen.findByText(/Added 1 items and 1 organizations/),
    ).toBeVisible();
    const writes = lastWrite(api);
    expect(writes.map((request) => request.path)).toEqual([
      "/admin/lists/organizations",
      "/admin/lists/certifications",
    ]);
    expect(writes[1].body).toMatchObject({
      title: "Accessibility Fundamentals",
      organizationId: "example-academy",
      issued: "2020",
    });
  });

  it("says so when none of the files are career files", async () => {
    installFakeAdminApi();
    renderAdmin("/admin/linkedin-import");
    const input = await screen.findByLabelText("Choose CSV files");
    fireEvent.change(input, {
      target: { files: [new File(["x"], "Connections.csv")] },
    });
    expect(
      await screen.findByText(/None of those files are career files/),
    ).toBeVisible();
  });
});

describe("admin: several repos per project", { timeout: 20_000 }, () => {
  function linkLabels() {
    const links = screen.getByRole("group", { name: "Links" });
    return within(links)
      .getAllByLabelText("Label")
      .map((input) => input.value);
  }

  it("adds, labels, and removes repos in the project form", async () => {
    installFakeAdminApi({ repositories: REPOS });
    const user = userEvent.setup();
    renderAdmin("/admin/projects/new");
    const picker = await screen.findByRole("group", {
      name: "GitHub repositories",
    });
    expect(within(picker).getByText("No repositories yet.")).toBeVisible();

    await user.selectOptions(
      within(picker).getByLabelText("Repository to add"),
      "sarabo-client",
    );
    await user.click(
      within(picker).getByRole("button", { name: "Add repository" }),
    );
    // The role is guessed from the name and saved as the link label.
    const role = within(picker).getByLabelText("Role of sarabo-client");
    expect(role).toHaveValue("client");
    expect(linkLabels()).toEqual(["Client repository"]);

    await user.selectOptions(role, "server");
    expect(linkLabels()).toEqual(["Server repository"]);

    await user.click(
      within(picker).getByRole("button", { name: "Add repository" }),
    );
    expect(linkLabels()).toEqual(["Server repository", "Repository"]);

    await user.click(
      within(picker).getByRole("button", { name: "Remove sarabo-client" }),
    );
    expect(linkLabels()).toEqual(["Repository"]);
    expect(within(picker).getByText("Programming")).toBeVisible();
  });

  it("adds a repo to an existing project from the repos page", async () => {
    const api = installFakeAdminApi({
      repositories: REPOS,
      withProjects: true,
    });
    const user = userEvent.setup();
    const router = renderAdmin("/admin/repositories");
    await user.selectOptions(
      await screen.findByLabelText("Project to add Programming to"),
      "sarabo",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Add Programming to the chosen project",
      }),
    );
    expect(router.state.location.pathname).toBe("/admin/projects/sarabo");
    expect(
      await screen.findByText(/Added Programming under GitHub repositories/),
    ).toBeVisible();
    expect(screen.getByText("Unsaved changes")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(
        lastWrite(api, "/admin/lists/projects/sarabo").at(-1).body.links,
      ).toContainEqual({
        label: "Repository",
        url: "https://github.com/jahidjubaer/Programming",
        type: "repository",
      }),
    );
  });
});

describe("admin: certifications and organizations", { timeout: 20_000 }, () => {
  it("lists what an organization issued, linked to each editor", async () => {
    installFakeAdminApi();
    renderAdmin("/admin/organizations/kaggle");
    const heading = await screen.findByRole("heading", {
      name: "Certifications & courses it issued",
    });
    const list = within(heading.closest("section"));
    expect(list.getByRole("link", { name: "Python" })).toHaveAttribute(
      "href",
      "/admin/certifications/kaggle-python",
    );
    expect(list.getByRole("link", { name: "Pandas" })).toBeVisible();
  });

  it("asks for a category and offers a course page link", async () => {
    installFakeAdminApi();
    renderAdmin("/admin/certifications/kaggle-python");
    expect(await screen.findByLabelText("Category")).toBeVisible();
    expect(screen.getByLabelText(/Course page/)).toBeVisible();
  });
});
