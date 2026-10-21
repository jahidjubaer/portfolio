import { describe, expect, it } from "vitest";
import { buildSeedContent } from "../../scripts/seed-content.js";
import {
  caseStudySchema,
  certificationSchema,
  contentSchema,
  findBrokenReferences,
  photoSchema,
  postSchema,
  projectSchema,
  roleSchema,
} from "../../src/schemas/content.js";
import { toYearMonth, upgradeContent } from "../../src/db/content-upgrade.js";
import { CASE_STUDY_TEMPLATE } from "../../src/schemas/case-study-template.js";

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

  it("groups roles under one organization, newest first", () => {
    const club = content.experience.find(
      (entry) => entry.organizationId === "metropolitan-university-sports-club",
    );
    expect(club.roles.map((role) => role.title)).toEqual([
      "Organizing Secretary",
      "Joint Office Secretary",
      "Member",
    ]);
    expect(club.roles[0].description).toMatch(/Premier League/);
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

  it("validates certifications", () => {
    const certificate = {
      id: "example",
      order: 0,
      title: "Example certificate",
      organizationId: "example-org",
      kind: "certification",
      status: "completed",
      issued: "2026-03",
    };
    expect(certificationSchema.safeParse(certificate).success).toBe(true);
    expect(
      certificationSchema.safeParse({ ...certificate, kind: "hobby" }).success,
    ).toBe(false);
    expect(
      certificationSchema.safeParse({ ...certificate, issued: "March 2026" })
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
      organizationId: "example-org",
      kind: "course",
    };
    expect(
      certificationSchema.safeParse({ ...base, status: "completed" }).success,
    ).toBe(false);
    expect(
      certificationSchema.safeParse({ ...base, status: "in-progress" }).success,
    ).toBe(true);
  });

  it("needs an end date or an explicit current role", () => {
    const role = { title: "Organizer", start: "2024-01" };
    expect(roleSchema.safeParse(role).success).toBe(false);
    expect(roleSchema.safeParse({ ...role, current: true }).success).toBe(true);
    expect(roleSchema.safeParse({ ...role, end: "2025" }).success).toBe(true);
    expect(
      roleSchema.safeParse({ ...role, end: "2025", current: true }).success,
    ).toBe(false);
    expect(roleSchema.safeParse({ ...role, end: "2023-12" }).success).toBe(
      false,
    );
    // Same year at different precision is not "before".
    expect(
      roleSchema.safeParse({ title: "x", start: "2024-06", end: "2024" })
        .success,
    ).toBe(true);
  });

  it("rejects ids that point at nothing", () => {
    const valid = buildSeedContent();
    expect(findBrokenReferences(valid)).toEqual([]);
    const broken = structuredClone(valid);
    broken.certifications[0].organizationId = "nowhere";
    broken.learningTracks.push({
      id: "react",
      order: 0,
      title: "React",
      status: "learning",
      resources: [{ label: "Course", organizationId: "missing" }],
      certificationIds: ["missing-cert"],
      projectSlugs: ["missing-project"],
      notes: [],
    });
    const messages = findBrokenReferences(broken).map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        '"nowhere" isn\'t in organizations.',
        '"missing-cert" isn\'t in certifications.',
        '"missing-project" isn\'t in projects.',
        '"missing" isn\'t in organizations.',
      ]),
    );
    expect(contentSchema.safeParse(broken).success).toBe(false);
  });
});

describe("case study sections", () => {
  const text = (id) => ({
    id,
    heading: id,
    type: "text",
    body: "Some **Markdown**.",
  });

  it("accepts text sections, including blank template ones", () => {
    const result = caseStudySchema.safeParse({
      role: "Sole Developer",
      sections: [
        text("problem"),
        { id: "hard-part", heading: "The hard part", type: "text", body: "" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("no longer has a gallery type, and needs unique ids", () => {
    const gallery = caseStudySchema.safeParse({
      sections: [{ id: "gallery", heading: "Gallery", type: "gallery" }],
    });
    expect(gallery.error.issues[0].path).toEqual(["sections", 0, "type"]);

    const duplicate = caseStudySchema.safeParse({
      sections: [text("overview"), text("overview")],
    });
    expect(duplicate.success).toBe(false);
  });

  it("seeds the Sarabo case study in the five-section template", () => {
    const sarabo = buildSeedContent().projects.find(
      (project) => project.slug === "sarabo",
    );
    expect(sarabo.caseStudy.sections.map((section) => section.id)).toEqual(
      CASE_STUDY_TEMPLATE.map((section) => section.id),
    );
    expect(
      sarabo.caseStudy.sections.find((s) => s.id === "how-it-works"),
    ).toMatchObject({ type: "diagram" });
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

describe("upgradeContent (R7 → organizations)", () => {
  const legacy = {
    profile: {
      name: "Jahid",
      education: {
        degree: "BSc in Computer Science and Engineering",
        university: "Metropolitan University, Sylhet",
        graduation: "August 2026",
      },
    },
    experience: [
      {
        id: "club-a",
        order: 0,
        date: "2023–2024",
        sortYear: 2023,
        category: "leadership",
        title: "Joint Secretary",
        organization: "Sports Club",
        description: "Short.",
      },
      {
        id: "club-b",
        order: 1,
        date: "2024–2025",
        sortYear: 2024,
        category: "leadership",
        title: "Organizing Secretary",
        organization: "Sports Club",
        description: "Short.",
        details: "Longer write-up.",
      },
      {
        id: "graduation",
        order: 2,
        date: "August 2026",
        sortYear: 2026,
        category: "education",
        title: "Graduation",
        organization: "Metropolitan University, Sylhet",
        description: "BSc",
      },
    ],
    certifications: [
      {
        id: "c1",
        order: 0,
        title: "Course",
        issuer: "EDGE, IICT SUST",
        category: "professional",
        status: "completed",
        issued: "November 2024",
      },
    ],
  };

  it("groups roles by organization and moves education out", () => {
    const upgraded = upgradeContent(legacy);
    expect(upgraded.experience).toHaveLength(1);
    expect(upgraded.experience[0].roles).toEqual([
      {
        title: "Organizing Secretary",
        start: "2024",
        end: "2025",
        description: "Longer write-up.",
      },
      {
        title: "Joint Secretary",
        start: "2023",
        end: "2024",
        description: "Short.",
      },
    ]);
    expect(upgraded.education).toEqual([
      expect.objectContaining({
        organizationId: "metropolitan-university",
        degree: "BSc",
        field: "Computer Science and Engineering",
        end: "2026-08",
      }),
    ]);
    expect(upgraded.profile).not.toHaveProperty("education");
    expect(upgraded.organizations.map((item) => item.name)).toEqual([
      "Sports Club",
      "Metropolitan University",
      "EDGE, IICT SUST",
    ]);
    expect(upgraded.certifications[0]).toEqual(
      expect.objectContaining({
        organizationId: "edge-iict-sust",
        kind: "certification",
        issued: "2024-11",
      }),
    );
    expect(upgraded.certifications[0]).not.toHaveProperty("issuer");
    expect(upgraded.learningTracks).toEqual([]);
  });

  it("leaves upgraded content alone", () => {
    const once = upgradeContent(legacy);
    expect(upgradeContent(once)).toBe(once);
  });

  it("reads year and month-year dates", () => {
    expect(toYearMonth("2024")).toBe("2024");
    expect(toYearMonth("November 2024")).toBe("2024-11");
    expect(toYearMonth("someday")).toBeUndefined();
  });
});
