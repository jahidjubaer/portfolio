import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const NOTE = {
  slug: "javascript-introduction",
  order: 0,
  title: "JavaScript introduction",
  excerpt: "Starting a series.",
  body: "Why JavaScript.",
  tags: ["JavaScript"],
  status: "published",
  publishedAt: "2025-09-12",
};
const blogDraft = (slug, title, publishedAt) => ({
  slug,
  order: 1,
  title,
  excerpt: "লেখা",
  body: "লেখা",
  tags: ["লেখাগুচ্ছ"],
  status: "draft",
  publishedAt,
  kind: "blog",
  originalUrl: `https://mdjahid-hasan.blogspot.com/${slug}.html`,
});

function lastWrite(api) {
  return api.requests.filter((request) => request.method !== "GET").at(-1);
}

describe("Admin → Writing list", () => {
  it("filters posts by kind and status, with counts", async () => {
    const user = userEvent.setup();
    installFakeAdminApi({
      overrides: {
        posts: [
          NOTE,
          blogDraft("golden-childhood", "সোনালী শৈশব", "2021-03-09"),
          blogDraft("moral-decline", "নৈতিকতার অবক্ষয়", "2021-03-13"),
        ],
      },
    });
    renderAdmin("/admin/posts");

    const chips = await screen.findByRole("group", { name: "Show writing" });
    expect(
      within(chips)
        .getAllByRole("button")
        .map((chip) => chip.textContent),
    ).toEqual(["All 3", "Notes 1", "Blog 2", "Drafts 2", "Published 1"]);

    await user.click(within(chips).getByRole("button", { name: /^Notes/ }));
    expect(screen.getByText(NOTE.title)).toBeInTheDocument();
    expect(screen.queryByText("সোনালী শৈশব")).toBeNull();
    expect(
      within(chips).getByRole("button", { name: /^Notes/ }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(within(chips).getByRole("button", { name: /^Blog/ }));
    expect(screen.queryByText(NOTE.title)).toBeNull();
    expect(screen.getByText("সোনালী শৈশব")).toBeInTheDocument();
    expect(screen.getAllByText(/^Blog · Draft$/)).toHaveLength(2);
  });

  it("publishes and unpublishes a post in one click", async () => {
    const user = userEvent.setup();
    const api = installFakeAdminApi({
      overrides: {
        posts: [blogDraft("golden-childhood", "সোনালী শৈশব", "2021-03-09")],
      },
    });
    renderAdmin("/admin/posts");

    await user.click(
      await screen.findByRole("button", { name: "Publish “সোনালী শৈশব”" }),
    );
    const write = lastWrite(api);
    expect(write.method).toBe("PUT");
    expect(write.path).toBe("/admin/lists/posts/golden-childhood");
    expect(write.body).toMatchObject({
      status: "published",
      publishedAt: "2021-03-09",
      kind: "blog",
    });
    expect(
      await screen.findByText(
        "“সোনালী শৈশব” is marked published. Press Publish to put it live.",
      ),
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: "Unpublish “সোনালী শৈশব”" }),
    );
    expect(lastWrite(api).body.status).toBe("draft");
  });

  it("opens filtered from a link, as the overview's drafts reminder does", async () => {
    installFakeAdminApi({
      overrides: {
        posts: [
          NOTE,
          blogDraft("moral-decline", "নৈতিকতার অবক্ষয়", "2021-03-13"),
        ],
      },
    });
    renderAdmin("/admin/posts?filter=drafts");
    const chips = await screen.findByRole("group", { name: "Show writing" });
    expect(
      within(chips).getByRole("button", { name: /^Drafts/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(NOTE.title)).toBeNull();
  });
});
