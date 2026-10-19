import { vi } from "vitest";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../../src/routes/route-config";
import { profile, socialProfiles } from "../../../src/data/profile";
import { certifications } from "../../../src/data/certifications";
import { capabilityGroups } from "../../../src/data/capabilities";
import { projects } from "../../../src/data/projects";

// Load the lazy admin chunk up front, so a test file's first render
// doesn't spend its findBy timeout transforming it under parallel load.
await import("../../../src/pages/admin");

export const ADMIN = {
  id: 139990599,
  login: "jahidjubaer",
  avatarUrl: "https://avatars.example/1",
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Stubs fetch with an in-memory admin API (session, content, and the
 * write endpoints) so admin pages run end to end in jsdom.
 * @param {{ signedIn?: boolean, withProjects?: boolean, repositories?: object, syncResult?: { status: number, body: object }, publishing?: object, publishResult?: { status: number, body: object } }} [options]
 */
export function installFakeAdminApi({
  signedIn = true,
  withProjects = false,
  repositories = {},
  syncResult = { status: 200, body: { success: true, data: { repoCount: 0 } } },
  publishing = {},
  publishResult = {
    status: 200,
    body: { success: true, data: { at: "2026-10-19T08:00:00Z", ok: true } },
  },
} = {}) {
  const { resume, ...profileFields } = profile;
  const state = {
    signedIn,
    content: {
      profile: {
        ...profileFields,
        resume: {
          filename: resume.filename,
          url: resume.url,
          updatedLabel: resume.updatedLabel,
        },
        socialProfiles,
      },
      projects: withProjects
        ? projects.map((project, order) =>
            structuredClone({ ...project, order }),
          )
        : [],
      experience: [],
      skills: capabilityGroups.map((group, order) => ({ ...group, order })),
      certifications: certifications.map((item, order) => ({
        ...item,
        order,
      })),
      beyond: { sports: [], volunteering: [] },
      photos: [],
      posts: [],
      repositories: {
        username: "jahidjubaer",
        tokenConfigured: false,
        sync: null,
        repos: [],
        warnings: [],
        ...repositories,
      },
      publishing: {
        configured: true,
        lastEditAt: null,
        lastPublishAt: null,
        hasUnpublishedChanges: false,
        history: [],
        ...publishing,
      },
    },
    requests: [],
  };

  const fetchMock = vi.fn(async (url, init = {}) => {
    const method = init.method ?? "GET";
    const path = new URL(String(url), "http://x").pathname.replace(
      /^\/api/,
      "",
    );
    const body = init.body ? JSON.parse(init.body) : undefined;
    state.requests.push({ method, path, body });

    if (path === "/auth/me") {
      return state.signedIn
        ? json(200, { success: true, user: ADMIN })
        : json(401, { success: false });
    }
    if (path === "/auth/logout") {
      state.signedIn = false;
      return json(200, { success: true });
    }
    if (path === "/admin/content") {
      return json(200, { success: true, data: structuredClone(state.content) });
    }

    if (path === "/admin/publish" && method === "POST") {
      if (publishResult.status === 200) {
        state.content.publishing = {
          ...state.content.publishing,
          hasUnpublishedChanges: false,
          lastPublishAt: publishResult.body.data.at,
        };
      }
      return json(publishResult.status, publishResult.body);
    }
    if (path === "/admin/github/sync" && method === "POST") {
      return json(syncResult.status, syncResult.body);
    }

    const single = path.match(/^\/admin\/singletons\/(\w+)$/);
    if (single && method === "PUT") {
      state.content[single[1]] = body;
      return json(200, { success: true, data: body });
    }

    const order = path.match(/^\/admin\/lists\/(\w+)\/order$/);
    if (order) {
      const list = state.content[order[1]];
      state.content[order[1]] = body.keys.map((key, index) => ({
        ...list.find((item) => (item.slug ?? item.id) === key),
        order: index,
      }));
      return json(200, { success: true });
    }

    const item = path.match(/^\/admin\/lists\/(\w+)(?:\/([^/]+))?$/);
    if (item) {
      const [, name, rawKey] = item;
      const key = rawKey && decodeURIComponent(rawKey);
      const list = state.content[name];
      const keyOf = (entry) => entry.slug ?? entry.id;
      if (method === "POST") {
        const created = { ...body, order: list.length };
        list.push(created);
        return json(201, { success: true, data: created });
      }
      const index = list.findIndex((entry) => keyOf(entry) === key);
      if (method === "PUT") {
        list[index] = { ...body, order: list[index].order };
        return json(200, { success: true, data: list[index] });
      }
      if (method === "DELETE") {
        list.splice(index, 1);
        return json(200, { success: true });
      }
    }
    return json(404, { success: false, error: "Not found" });
  });

  vi.stubGlobal("fetch", fetchMock);
  return state;
}

export function renderAdmin(path = "/admin") {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}
