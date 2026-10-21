import { describe, expect, it } from "vitest";
import { parseGoodreadsRss } from "../../src/services/goodreadsService.js";

const item = (fields) =>
  `<item>${Object.entries(fields)
    .map(([tag, value]) => `<${tag}>${value}</${tag}>`)
    .join("\n")}</item>`;

const FEED = `<?xml version="1.0"?><rss version="2.0"><channel>
${item({
  title: "<![CDATA[Clean Code & Craft]]>",
  book_id: "123",
  book_large_image_url: "<![CDATA[https://i.gr-assets.com/books/123.jpg]]>",
  num_pages: "272",
  author_name: "Robert Martin",
  user_rating: "4",
  user_read_at: "<![CDATA[Sun, 30 Nov 2025 00:00:00 +0000]]>",
  user_date_added: "<![CDATA[Sun, 30 Nov 2025 11:05:17 -0800]]>",
  user_shelves: "<![CDATA[programming, favorites, not-collected]]>",
  book_published: "2008",
})}
${item({
  title: "No cover &amp; no date",
  book_id: "456",
  book_large_image_url:
    "<![CDATA[https://s.gr-assets.com/assets/nophoto/book/111x148.png]]>",
  num_pages: "",
  author_name: "Someone",
  user_rating: "0",
  user_read_at: "",
  user_date_added: "<![CDATA[Thu, 14 Aug 2025 10:00:00 -0700]]>",
  user_shelves: "",
  book_published: "",
})}
</channel></rss>`;

describe("parseGoodreadsRss", () => {
  it("reads each book's facts, and only the read date Jahid entered", () => {
    const [first, second] = parseGoodreadsRss(FEED, "read");
    expect(first).toEqual({
      bookId: "123",
      shelf: "read",
      title: "Clean Code & Craft",
      author: "Robert Martin",
      url: "https://www.goodreads.com/book/show/123",
      coverSource: "https://i.gr-assets.com/books/123.jpg",
      pages: 272,
      published: 2008,
      rating: 4,
      readAt: "2025-11-30",
      addedAt: "2025-11-30",
      tags: ["programming"],
      favorite: true,
    });
    expect(second).toMatchObject({
      title: "No cover & no date",
      coverSource: null,
      pages: null,
      published: null,
      rating: null,
      readAt: null,
      favorite: false,
    });
  });

  it("rejects an answer that isn't a feed", () => {
    expect(() => parseGoodreadsRss("<html>Sign in</html>", "read")).toThrow(
      /feed/,
    );
  });
});
