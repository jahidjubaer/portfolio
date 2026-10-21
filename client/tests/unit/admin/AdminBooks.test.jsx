import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installFakeAdminApi, renderAdmin } from "./fake-admin-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const BOOK = {
  bookId: "40121378",
  shelf: "currently-reading",
  title: "Atomic Habits",
  author: "James Clear",
  url: "https://www.goodreads.com/book/show/40121378",
  cover: null,
  readAt: null,
  hidden: false,
};

describe("admin books", { timeout: 15_000 }, () => {
  it("asks for a Goodreads id before syncing", async () => {
    installFakeAdminApi();
    renderAdmin("/admin/books");
    expect(
      await screen.findByRole("button", { name: "Sync now" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/Add your Goodreads user ID under/),
    ).toBeInTheDocument();
  });

  it("syncs and hides a book", async () => {
    const user = userEvent.setup();
    const api = installFakeAdminApi({
      overrides: {
        beyond: { goodreadsUserId: "192903871", sports: [], volunteering: [] },
        bookStatus: { books: [BOOK], sync: null },
      },
    });
    renderAdmin("/admin/books");

    await user.click(await screen.findByRole("button", { name: "Sync now" }));
    expect(await screen.findByText("Books synced.")).toBeInTheDocument();
    expect(screen.getByText(/Last synced/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Hide “Atomic Habits”" }),
    );
    await waitFor(() =>
      expect(api.requests.at(-2)).toMatchObject({
        method: "PATCH",
        path: "/admin/books/40121378",
        body: { hidden: true },
      }),
    );
    expect(
      await screen.findByRole("checkbox", { name: "Hide “Atomic Habits”" }),
    ).toBeChecked();
  });
});
