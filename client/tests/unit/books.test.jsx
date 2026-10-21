import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readingStats, shelfTags, tagLabel } from "../../src/data/books";
import { ReadingSection } from "../../src/features/books/ReadingSection";

function book(bookId, extra = {}) {
  return {
    bookId,
    title: `Book ${bookId}`,
    author: "Author",
    url: `https://www.goodreads.com/book/show/${bookId}`,
    cover: null,
    pages: 100,
    published: null,
    rating: null,
    readAt: null,
    addedAt: "2025-08-14",
    tags: [],
    favorite: false,
    ...extra,
  };
}

const READ = [
  book("1", { readAt: "2026-05-19", tags: ["fiction"], rating: 4 }),
  book("2", { readAt: "2025-11-30", tags: ["fiction"], favorite: true }),
  book("3", { tags: ["selfhelp"], pages: null, favorite: true }),
  book("4", {
    title: "গ্রোথ হ্যাকিং",
    tags: ["selfhelp"],
    cover: { url: "https://x.public.blob.vercel-storage.com/books/4.jpg" },
  }),
  book("5", { tags: ["poetry"] }),
];

describe("reading data", () => {
  it("counts only what Goodreads knows, undated books apart", () => {
    expect(readingStats(READ)).toEqual({
      count: 5,
      pages: 400,
      years: [
        { year: "2026", count: 1 },
        { year: "2025", count: 1 },
      ],
      undated: 3,
    });
  });

  it("offers shelf tags used on two books or more", () => {
    expect(shelfTags(READ).map((item) => item.tag)).toEqual([
      "fiction",
      "selfhelp",
    ]);
    expect(tagLabel("historical-fiction")).toBe("Historical fiction");
  });
});

describe("ReadingSection", () => {
  it("shows what's being read, the counts, and a filterable shelf", async () => {
    const user = userEvent.setup();
    render(
      <ReadingSection
        books={{
          profileUrl: "https://www.goodreads.com/user/show/1",
          syncedAt: "2026-10-21T00:00:00Z",
          currentlyReading: [book("9", { title: "Atomic Habits" })],
          read: READ,
        }}
      />,
    );

    expect(screen.getByText("▸ Currently reading")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Atomic Habits/ })).toHaveAttribute(
      "href",
      "https://www.goodreads.com/book/show/9",
    );
    expect(screen.getByText("Read · 5 books, 400 pages")).toBeInTheDocument();
    expect(
      screen.getByText("2026: 1 · 2025: 1 · read date not recorded: 3"),
    ).toBeInTheDocument();
    expect(screen.getByText("Rated 4 of 5")).toBeInTheDocument();
    // A Bangla title is marked as Bangla.
    expect(screen.getAllByText("গ্রোথ হ্যাকিং")[0]).toHaveAttribute(
      "lang",
      "bn",
    );

    const filters = screen.getByRole("group", { name: "Filter the shelf" });
    await user.click(
      within(filters).getByRole("button", { name: "Favourites" }),
    );
    expect(
      within(filters).getByRole("button", { name: "Favourites" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("link", { name: /Book 1/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Book 2/ })).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /My shelves on Goodreads/ }),
    ).toHaveAttribute("href", "https://www.goodreads.com/user/show/1");
  });
});
