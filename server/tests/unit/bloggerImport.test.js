import { describe, expect, it } from "vitest";
import {
  DEFAULT_ALBUM,
  bloggerHtmlToMarkdown,
  fullSizeImageUrl,
  imageDimensions,
  photosFromEntry,
  postFromEntry,
  slugFromPermalink,
  truncate,
} from "../../src/db/blogger-import.js";

const IMG =
  "https://blogger.googleusercontent.com/img/b/R29v/AVvX/w400-h225/Shot%20(1).png";

function entry({ html, title = "A title", href, labels = [], published }) {
  return {
    title: { $t: title },
    content: { $t: html },
    published: { $t: published ?? "2025-09-12T10:00:00.000+06:00" },
    category: labels.map((term) => ({ term })),
    link: [
      { rel: "alternate", type: "text/html", href },
      { rel: "self", type: "application/atom+xml", href: "https://x/feeds/1" },
    ],
  };
}

describe("bloggerHtmlToMarkdown", () => {
  it("keeps structure and drops Blogger's styling and widgets", () => {
    const html = `
      <p><span style="font-family: Tiro Bangla;">&nbsp;</span></p>
      <p><span style="font-size: large">আজকে <b>ন্যাপকিন </b>সম্পর্কে</span></p>
      <div class="separator"><a href="${IMG.replace("w400-h225", "s1920")}"><img alt="" src="${IMG}" /></a></div>
      <p>See <a href="https://code.visualstudio.com/download">VS Code</a> and <a href="#">part 1</a>.<br />Next line</p>
      <pre style="color:black"><code><div><span>console</span>.log('hi');</div><div>x = 1;</div></code></pre>
      <ol><li><p><span>one</span></p></li><li>two <i>2</i></li></ol>
      <style>.tNtf{}</style><script>copyC()</script>
      <p>Stars * and _under_ stay text</p>`;
    const { markdown, images } = bloggerHtmlToMarkdown(html);
    expect(markdown).toBe(
      [
        "আজকে **ন্যাপকিন** সম্পর্কে",
        `![](${IMG})`,
        "See [VS Code](https://code.visualstudio.com/download) and part 1.\\\nNext line",
        "```\nconsole.log('hi');\nx = 1;\n```",
        "1. one\n2. two *2*",
        "Stars \\* and \\_under\\_ stay text",
      ].join("\n\n"),
    );
    expect(images).toEqual([{ src: IMG, alt: "" }]);
  });
});

describe("photosFromEntry", () => {
  it("uses the title as caption, adds a Blogger caption, and names the album", () => {
    const html = `<table class="tr-caption-container"><tbody>
      <tr><td><a href="#"><img src="${IMG}" data-original-width="1600" data-original-height="900" /></a></td></tr>
      <tr><td class="tr-caption">Jadukata River, Sunamganj</td></tr>
      </tbody></table><img src="${IMG.replace("w400-h225", "s72-c")}" />
      <img src="https://blogger.googleusercontent.com/tracker.gif" data-original-width="1" />`;
    const [photo, ...rest] = photosFromEntry(
      entry({
        html,
        title: "How the  little child drives a boat!",
        href: "https://photo.blogspot.com/2023/12/how-little-child.html",
        labels: ["FEATURED", "StreetPhotography"],
      }),
    );
    // The second <img> is the same photo at another size.
    expect(rest).toEqual([]);
    expect(photo).toMatchObject({
      id: "2023-12-how-little-child",
      src: IMG.replace("w400-h225", "s1600-rj-l85"),
      caption:
        "How the little child drives a boat! — Jadukata River, Sunamganj",
      alt: "How the little child drives a boat! — Jadukata River, Sunamganj",
      album: "Street photography",
    });
  });

  it("falls back to the default album", () => {
    const [photo] = photosFromEntry(
      entry({
        html: `<img src="${IMG}" alt="A boat" />`,
        href: "https://p.blogspot.com/2024/01/blog-post_24.html",
      }),
    );
    expect(photo).toMatchObject({
      alt: "A boat",
      album: DEFAULT_ALBUM,
      id: "2024-01-blog-post-24",
    });
  });
});

describe("postFromEntry", () => {
  it("makes a leading image the cover and leaves other images in the body", () => {
    const second = IMG.replace("Shot", "Other");
    const post = postFromEntry(
      entry({
        html: `<div><img src="${IMG}" /></div><p>Intro text</p><div><img src="${second}" /></div>`,
        title: "Napkin | টুলস",
        href: "https://notes.blogspot.com/2025/08/blog-post.html",
        labels: ["এআই", "টুলস"],
      }),
      { "https://notes.blogspot.com/2025/08/blog-post.html": "napkin-ai" },
    );
    expect(post).toMatchObject({
      slug: "napkin-ai",
      title: "Napkin | টুলস",
      excerpt: "Intro text",
      body: `Intro text\n\n![](${second})`,
      tags: ["এআই", "টুলস"],
      status: "published",
      publishedAt: "2025-09-12",
      cover: IMG.replace("w400-h225", "s1600"),
      coverAlt: "Cover image for “Napkin | টুলস”",
      images: [second],
    });
  });

  it("keeps a first image that sits mid-post in the body", () => {
    const post = postFromEntry(
      entry({
        html: `<p>Before</p><img src="${IMG}" /><p>After</p>`,
        href: "https://notes.blogspot.com/2025/09/javascript.html",
      }),
    );
    expect(post.slug).toBe("2025-09-javascript");
    expect(post.body).toBe(`Before\n\n![](${IMG})\n\nAfter`);
    expect(post.images).toEqual([IMG]);
  });
});

describe("helpers", () => {
  it("rewrites both Blogger CDN URL shapes to the 1600 px variant", () => {
    expect(fullSizeImageUrl("https://h/img/b/x/w474-h311/a.png")).toBe(
      "https://h/img/b/x/s1600/a.png",
    );
    expect(
      fullSizeImageUrl(
        "https://blogger.googleusercontent.com/img/a/TOKEN=w640-h442",
      ),
    ).toBe("https://blogger.googleusercontent.com/img/a/TOKEN=s1600");
    expect(
      fullSizeImageUrl("https://blogger.googleusercontent.com/img/a/TOKEN"),
    ).toBe("https://blogger.googleusercontent.com/img/a/TOKEN=s1600");
  });

  it("slugs permalinks and truncates on a word", () => {
    expect(
      slugFromPermalink("https://x.blogspot.com/2025/09/javascript_12.html"),
    ).toBe("2025-09-javascript-12");
    expect(truncate("one two three four", 12)).toBe("one two…");
  });

  it("reads image sizes from file headers", () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47]);
    new DataView(png.buffer).setUint32(16, 1600);
    new DataView(png.buffer).setUint32(20, 900);
    expect(imageDimensions(png)).toEqual({ width: 1600, height: 900 });

    // SOI, an APP0 segment, then SOF0 with height 1067 and width 1600.
    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11,
      0x08, 0x04, 0x2b, 0x06, 0x40, 0x03, 0x00, 0x00,
    ]);
    expect(imageDimensions(jpeg)).toEqual({ width: 1600, height: 1067 });

    expect(
      imageDimensions(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])),
    ).toBeNull();
  });
});
