import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function repo(id, name, extra = {}) {
  return {
    id,
    name,
    url: `https://github.com/jahidjubaer/${name}`,
    description: null,
    language: "JavaScript",
    topics: [],
    homepage: null,
    stars: 0,
    fork: false,
    archived: false,
    pushedAt: "2026-10-18T09:00:00Z",
    projects: [],
    ...extra,
  };
}

const SYNCED = {
  sync: {
    syncedAt: "2026-10-19T06:00:00Z",
    lastAttemptAt: "2026-10-19T06:00:00Z",
    repoCount: 3,
    error: null,
  },
  repos: [
    repo(1, "sarabo-client", { projects: ["sarabo"], stars: 3 }),
    repo(2, "jahid-capture-server", {
      description: "Screenshot capture API",
      homepage: "https://jahid-capture-server.vercel.app",
      topics: ["express", "puppeteer"],
    }),
    repo(3, "some-fork", { fork: true }),
  ],
  warnings: [
    {
      project: "ict-crack",
      projectTitle: "ICT Crack",
      url: "https://github.com/jahidjubaer/hsc-ict-creck-server",
      message:
        "Server repository isn't a public repository on GitHub anymore (deleted, renamed, or made private).",
    },
  ],
};

describe("admin GitHub repos", { timeout: 20_000 }, () => {
  it("lists own repos, the projects using them, and broken links", async () => {
    installFakeAdminApi({ withProjects: true, repositories: SYNCED });
    const user = userEvent.setup();
    renderAdmin("/admin/repositories");

    await screen.findByRole("heading", { level: 1, name: "GitHub repos" });
    expect(screen.getByText(/3 public repos/)).toBeInTheDocument();
    expect(screen.getByText("GITHUB_TOKEN").closest("p")).toHaveTextContent(
      /60 requests an hour/,
    );

    const warnings = screen.getByRole("region", { name: "Needs attention" });
    expect(
      within(warnings).getByRole("link", { name: "ICT Crack" }),
    ).toHaveAttribute("href", "/admin/projects/ict-crack");

    const client = screen.getByRole("link", { name: /sarabo-client/ });
    const row = client.closest("li");
    expect(within(row).getByRole("link", { name: "Sarabo" })).toHaveAttribute(
      "href",
      "/admin/projects/sarabo",
    );
    expect(within(row).getByText(/JavaScript · updated/)).toBeInTheDocument();
    expect(within(row).getByText("stars")).toBeInTheDocument();

    expect(screen.queryByText("some-fork")).toBeNull();
    await user.click(screen.getByLabelText("Show forks (1)"));
    expect(screen.getByText("some-fork")).toBeInTheDocument();
  });

  it("syncs on request and reports the result", async () => {
    const api = installFakeAdminApi({
      repositories: SYNCED,
      syncResult: {
        status: 200,
        body: { success: true, data: { repoCount: 37 } },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/repositories");

    await user.click(await screen.findByRole("button", { name: "Sync now" }));
    expect(await screen.findByText("Synced 37 public repos.")).toBeVisible();
    expect(
      api.requests.some(
        (request) =>
          request.method === "POST" && request.path === "/admin/github/sync",
      ),
    ).toBe(true);
    // The content (and so the repo list) is reloaded after the sync.
    expect(
      api.requests.filter((request) => request.path === "/admin/content"),
    ).toHaveLength(2);
  });

  it("explains a failed sync", async () => {
    installFakeAdminApi({
      repositories: {
        ...SYNCED,
        sync: {
          ...SYNCED.sync,
          lastAttemptAt: "2026-10-19T07:00:00Z",
          error: "GitHub's rate limit is used up. Try again after 08:00 UTC.",
        },
      },
      syncResult: {
        status: 503,
        body: {
          success: false,
          error: "GitHub's rate limit is used up. Try again after 08:00 UTC.",
        },
      },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/repositories");

    expect(await screen.findByText(/The last sync .* failed/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Sync now" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "GitHub's rate limit is used up.",
      ),
    );
  });

  it("starts a project prefilled from a repo", async () => {
    const api = installFakeAdminApi({ repositories: SYNCED });
    const user = userEvent.setup();
    const router = renderAdmin("/admin/repositories");

    await user.click(
      await screen.findByRole("button", {
        name: "Add jahid-capture-server as a project",
      }),
    );
    await screen.findByRole("heading", { level: 1, name: "New project" });
    expect(
      screen.getByText(/Prefilled from jahid-capture-server/),
    ).toBeVisible();
    expect(screen.getByLabelText("URL slug")).toHaveValue(
      "jahid-capture-server",
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Jahid Capture Server");
    expect(screen.getByLabelText("Summary")).toHaveValue(
      "Screenshot capture API",
    );
    expect(screen.getByLabelText("Status")).toHaveValue("live");

    await user.type(screen.getByLabelText("Project type"), "API");
    await user.click(screen.getByRole("button", { name: "Add project" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        "/admin/projects/jahid-capture-server",
      ),
    );
    const created = api.requests.findLast((r) => r.method === "POST").body;
    expect(created).toMatchObject({
      stack: ["JavaScript", "express", "puppeteer"],
      links: [
        {
          label: "Live site",
          url: "https://jahid-capture-server.vercel.app",
          type: "live",
        },
        {
          label: "Repository",
          url: "https://github.com/jahidjubaer/jahid-capture-server",
          type: "repository",
        },
      ],
      seo: { title: "Jahid Capture Server" },
    });
  });

  it("shows broken links on the overview", async () => {
    installFakeAdminApi({ repositories: SYNCED });
    renderAdmin("/admin");
    expect(
      await screen.findByText("1 project link needs attention"),
    ).toBeVisible();
  });
});
