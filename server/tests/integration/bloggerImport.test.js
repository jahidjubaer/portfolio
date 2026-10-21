import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { importBlogger } from "../../src/db/blogger-import.js";

const NOTES = "https://notes.blogspot.com";
const image = (name) =>
  `https://blogger.googleusercontent.com/img/b/R29v/${name}/w400-h225/${name}.jpg`;

function entry({ html, title, href, published }) {
  return {
    title: { $t: title },
    content: { $t: html },
    published: { $t: published },
    link: [{ rel: "alternate", type: "text/html", href }],
  };
}

const photoEntries = [
  entry({
    html: `<img src="${image("old")}" />`,
    title: "Old photo",
    href: "https://photos.blogspot.com/2023/12/old.html",
    published: "2023-12-08T10:00:00Z",
  }),
  entry({
    html: `<img src="${image("new")}" />`,
    title: "New photo",
    href: "https://photos.blogspot.com/2026/06/new.html",
    published: "2026-06-30T10:00:00Z",
  }),
];

const postEntries = [
  entry({
    html: `<img src="${image("cover")}" /><p>Part two.</p><img src="${image("shot")}" /><p>Previous: <a href="${NOTES}/2025/09/one.html">part one</a></p>`,
    title: "Part two",
    href: `${NOTES}/2025/09/two.html`,
    published: "2025-09-13T10:00:00Z",
  }),
  entry({
    html: `<p>Part one.</p><img src="${image("intro")}" /><p>More.</p>`,
    title: "Part one",
    href: `${NOTES}/2025/09/one.html`,
    published: "2025-09-12T10:00:00Z",
  }),
];

let mongo;
let client;
let db;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongo.getUri());
  db = client.db("blogger-import-test");
}, 120_000);

afterAll(async () => {
  await client?.close();
  await mongo?.stop();
});

describe("importBlogger", () => {
  it("reports without writing on a dry run, then imports once", async () => {
    const rehost = vi.fn(async (src) => ({
      url: `https://store.public.blob.vercel-storage.com/photos/${src.split("/")[6]}.jpg`,
      width: 1600,
      height: 900,
    }));
    const options = {
      photoEntries,
      postEntries,
      rehost,
      slugs: { [`${NOTES}/2025/09/one.html`]: "part-one" },
    };

    const dry = await importBlogger(db, { ...options, dryRun: true });
    expect(dry.photos.map((photo) => photo.id)).toEqual([
      "2026-06-new",
      "2023-12-old",
    ]);
    expect(dry.posts.map((post) => post.slug)).toEqual([
      "2025-09-two",
      "part-one",
    ]);
    expect(rehost).not.toHaveBeenCalled();
    expect(await db.collection("photos").countDocuments()).toBe(0);

    await importBlogger(db, options);
    const photos = await db
      .collection("photos")
      .find()
      .sort({ order: 1 })
      .toArray();
    expect(
      photos.map((photo) => [photo.id, photo.order, photo.caption]),
    ).toEqual([
      ["2026-06-new", 0, "New photo"],
      ["2023-12-old", 1, "Old photo"],
    ]);
    expect(photos[0].image.url).toMatch(/blob\.vercel-storage\.com/);
    // Photos are fetched as compressed JPEGs; post images as they are.
    expect(rehost).toHaveBeenCalledWith(
      "https://blogger.googleusercontent.com/img/b/R29v/new/s1600-rj-l85/new.jpg",
    );
    expect(rehost).toHaveBeenCalledWith(
      "https://blogger.googleusercontent.com/img/b/R29v/shot/s1600/shot.jpg",
    );

    const two = await db.collection("posts").findOne({ slug: "2025-09-two" });
    expect(two.cover.url).toContain("/photos/cover.jpg");
    expect(two.body).toBe(
      "Part two.\n\n![](https://store.public.blob.vercel-storage.com/photos/shot.jpg)\n\nPrevious: [part one](/writing/part-one)",
    );
    expect(rehost).toHaveBeenCalledTimes(5);

    // A first image in the middle of a post is both the cover and in the
    // text: one upload, one URL.
    const one = await db.collection("posts").findOne({ slug: "part-one" });
    expect(one.body).toContain(one.cover.url);

    const again = await importBlogger(db, options);
    expect(again.photos).toEqual([]);
    expect(again.posts).toEqual([]);
    expect(again.skipped).toHaveLength(4);
    expect(rehost).toHaveBeenCalledTimes(5);
  });

  it("imports the personal blog as drafts of kind blog", async () => {
    const rehost = vi.fn(async (src) => ({
      url: `https://store.public.blob.vercel-storage.com/photos/${src.split("/")[6]}.jpg`,
      width: 1600,
      height: 900,
    }));
    const href = "https://personal.blogspot.com/2021/03/blog-post.html";
    const report = await importBlogger(db, {
      photoEntries: [],
      postEntries: [],
      blogEntries: [
        entry({
          html: `<img src="${image("lake")}" /><p>নীলাদ্রি লেক</p>`,
          title: "নীলাদ্রি লেক",
          href,
          published: "2021-03-09T10:00:00Z",
        }),
      ],
      rehost,
      slugs: { [href]: "niladri-lake" },
    });
    expect(report.posts).toHaveLength(1);

    const post = await db.collection("posts").findOne({ slug: "niladri-lake" });
    expect(post).toMatchObject({
      status: "draft",
      kind: "blog",
      originalUrl: href,
      publishedAt: "2021-03-09",
      body: "নীলাদ্রি লেক",
    });
    expect(post.cover.url).toContain("/photos/lake.jpg");
  });
});
