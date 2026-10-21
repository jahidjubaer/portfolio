import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const TRACK = {
  id: "react",
  order: 0,
  title: "Advanced React",
  status: "learning",
  resources: [],
  certificationIds: [],
  projectSlugs: [],
  notes: [],
  syllabus: [
    { title: "Rendering", status: "done" },
    { title: "Hooks", status: "doing" },
  ],
};
const SECRET = {
  ...TRACK,
  id: "secret",
  order: 1,
  title: "Secret",
  visibility: "private",
  syllabus: [],
};

function lastWrite(api) {
  return api.requests.filter((request) => request.method !== "GET").at(-1);
}

describe("admin study log", { timeout: 15_000 }, () => {
  it("logs a session from the quick-add form", async () => {
    const api = installFakeAdminApi({
      overrides: { learningTracks: [TRACK, SECRET] },
    });
    const user = userEvent.setup();
    renderAdmin("/admin/studyLog");

    const form = await screen.findByRole("form", {
      name: "What did you study today?",
    });
    expect(
      within(form).getByRole("option", { name: "Secret (private)" }),
    ).toBeInTheDocument();
    await user.type(within(form).getByLabelText("Topic (optional)"), "Hooks");
    await user.type(within(form).getByLabelText("Minutes (optional)"), "45");
    await user.type(
      within(form).getByLabelText("What I studied"),
      "useEffect cleanup.",
    );
    await user.click(within(form).getByRole("checkbox", { name: /Private/ }));
    await user.click(within(form).getByRole("button", { name: "Log it" }));

    await waitFor(() =>
      expect(lastWrite(api)).toMatchObject({
        method: "POST",
        path: "/admin/lists/studyLog",
        body: {
          trackId: "react",
          topic: "Hooks",
          minutes: 45,
          body: "useEffect cleanup.",
          visibility: "private",
        },
      }),
    );
    expect(lastWrite(api).body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(await screen.findByText(/Logged\./)).toBeInTheDocument();
    // The new private entry is listed with a lock.
    expect(
      await screen.findByRole("img", { name: "Private" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hooks", { selector: "span" })).toBeInTheDocument();
  });

  it("shows a track's progress and privacy in the list", async () => {
    installFakeAdminApi({ overrides: { learningTracks: [TRACK, SECRET] } });
    renderAdmin("/admin/learningTracks");
    expect(
      await screen.findByText("Now learning · 1 of 2 topics done"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Private" })).toHaveLength(1);
  });
});
