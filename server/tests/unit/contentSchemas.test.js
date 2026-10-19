import { describe, expect, it } from "vitest";
import { buildSeedContent } from "../../scripts/seed-content.js";
import {
  caseStudySchema,
  certificationSchema,
  photoSchema,
  postSchema,
  projectSchema,
} from "../../src/schemas/content.js";

const BLOB_IMAGE = {
  url: "https://store.public.blob.vercel-storage.com/photos/a-x1.webp",
  width: 1600,
  height: 1067,
};

describe("seed content", () => {
  const content = buildSeedContent();

  it("migrates every client data file into a valid snapshot", () => {
    expect(content.profile.name).toBe("Jahid Hasan");
    expect(content.projects.map((project) => project.slug)).toContain("sarabo");
    expect(content.skills.length).toBeGreaterThan(0);
    expect(content.experience.length).toBeGreaterThan(0);
    expect(content.certifications.length).toBeGreaterThan(0);
  });

  it("numbers list items in their original order", () => {
    expect(content.projects.map((project) => project.order)).toEqual(
      content.projects.map((_project, index) => index),
    );
  });

  it("attaches the longer leadership write-up to matching experience", () => {
    const organizing = content.experience.find(
      (event) => event.id === "sports-club-organizing-secretary",
    );
    expect(organizing.details).toMatch(/Premier League/);
  });

  it("does not store the build-derived résumé availability flag", () => {
    expect(content.profile.resume).not.toHaveProperty("available");
  });
});

describe("content schemas", () => {
  it("rejects a complete case study without content", () => {
    const [project] = buildSeedContent().projects;
    const result = projectSchema.safeParse({
      ...project,
      caseStudyStatus: "complete",
      caseStudy: null,
    });
    expect(result.success).toBe(false);
  });

  it("validates certifications by category", () => {
    const certificate = {
      id: "example",
      order: 0,
      title: "Example certificate",
      issuer: "Example issuer",
      category: "professional",
      status: "completed",
      issued: "2026",
    };
    expect(certificationSchema.safeParse(certificate).success).toBe(true);
    expect(
      certificationSchema.safeParse({ ...certificate, category: "hobby" })
        .success,
    ).toBe(false);
    expect(
      certificationSchema.safeParse({
        ...certificate,
        credentialUrl: "not a url",
      }).success,
    ).toBe(false);
  });

  it("needs an issue date only once a certification is completed", () => {
    const base = {
      id: "example",
      order: 0,
      title: "Example course",
      issuer: "Example issuer",
      category: "professional",
    };
    expect(
      certificationSchema.safeParse({ ...base, status: "completed" }).success,
    ).toBe(false);
    expect(
      certificationSchema.safeParse({ ...base, status: "in-progress" }).success,
    ).toBe(true);
  });
});

describe("case study sections", () => {
  const text = (id) => ({
    id,
    heading: id,
    type: "text",
    body: "Some **Markdown**.",
  });

  it("accepts text and gallery sections", () => {
    const result = caseStudySchema.safeParse({
      role: "Sole Developer",
      sections: [
        text("overview"),
        { id: "gallery", heading: "Gallery", type: "gallery" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("needs a body on text sections and unique ids", () => {
    const empty = caseStudySchema.safeParse({
      sections: [{ id: "overview", heading: "Overview", type: "text" }],
    });
    expect(empty.error.issues[0].path).toEqual(["sections", 0, "body"]);

    const duplicate = caseStudySchema.safeParse({
      sections: [text("overview"), text("overview")],
    });
    expect(duplicate.success).toBe(false);
  });

  it("seeds the Sarabo case study as sections", () => {
    const sarabo = buildSeedContent().projects.find(
      (project) => project.slug === "sarabo",
    );
    expect(sarabo.caseStudy.sections[0]).toMatchObject({
      id: "overview",
      type: "text",
    });
    expect(
      sarabo.caseStudy.sections.find((section) => section.id === "gallery"),
    ).toMatchObject({ type: "gallery" });
  });
});

describe("photos and posts", () => {
  const photo = {
    id: "p1",
    order: 0,
    image: BLOB_IMAGE,
    alt: "Batsman mid-swing at dusk",
    album: "Cricket",
  };

  it("only accepts uploaded images, with a description", () => {
    expect(photoSchema.safeParse(photo).success).toBe(true);
    const linked = photoSchema.safeParse({
      ...photo,
      image: { ...BLOB_IMAGE, url: "https://example.com/a.jpg" },
    });
    expect(linked.error.issues[0].message).toMatch(/Upload the image/);
    expect(photoSchema.safeParse({ ...photo, alt: "" }).success).toBe(false);
  });

  const post = {
    slug: "first-post",
    order: 0,
    title: "First post",
    excerpt: "What this post is about.",
    body: "# Hello\n\nBody text.",
    tags: ["react"],
    status: "draft",
  };

  it("needs a date only once a post is published", () => {
    expect(postSchema.safeParse(post).success).toBe(true);
    const published = postSchema.safeParse({ ...post, status: "published" });
    expect(published.error.issues[0].path).toEqual(["publishedAt"]);
    expect(
      postSchema.safeParse({
        ...post,
        status: "published",
        publishedAt: "2026-10-19",
      }).success,
    ).toBe(true);
    expect(
      postSchema.safeParse({ ...post, publishedAt: "19/10/2026" }).success,
    ).toBe(false);
  });

  it("needs alt text for a cover image", () => {
    const result = postSchema.safeParse({ ...post, cover: BLOB_IMAGE });
    expect(result.error.issues[0].path).toEqual(["coverAlt"]);
  });
});
