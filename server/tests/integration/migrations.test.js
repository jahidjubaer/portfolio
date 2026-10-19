import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import {
  migrateCaseStudies,
  migrateToOrganizations,
} from "../../src/db/migrations.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

const seedProjects = buildSeedContent().projects;
const sarabo = seedProjects.find((project) => project.slug === "sarabo");
const OLD_SHAPE = {
  overview: "Old overview.",
  roles: [{ name: "Customer", description: "Submits requests." }],
  sections: [{ id: "overview", heading: "Overview" }],
};

let mongo;
let client;
let db;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongo.getUri());
  db = client.db("migrations-test");
}, 120_000);

afterAll(async () => {
  await client?.close();
  await mongo?.stop();
});

describe("migrateCaseStudies", () => {
  it("converts old case studies from the seed and reports the rest", async () => {
    const projects = db.collection("projects");
    await projects.deleteMany({});
    await projects.insertMany([
      { slug: "sarabo", title: "Edited title", caseStudy: OLD_SHAPE },
      { slug: "custom", caseStudy: OLD_SHAPE },
      { slug: "ict-crack", caseStudy: null },
    ]);

    const dry = await migrateCaseStudies(db, seedProjects, { dryRun: true });
    expect(dry).toEqual({ converted: ["sarabo"], manual: ["custom"] });
    expect((await projects.findOne({ slug: "sarabo" })).caseStudy).toEqual(
      OLD_SHAPE,
    );

    await migrateCaseStudies(db, seedProjects);
    const migrated = await projects.findOne({ slug: "sarabo" });
    expect(migrated.caseStudy).toEqual(sarabo.caseStudy);
    // Only the case study is replaced; other edits survive.
    expect(migrated.title).toBe("Edited title");

    expect(await migrateCaseStudies(db, seedProjects)).toEqual({
      converted: [],
      manual: ["custom"],
    });
  });
});

describe("migrateToOrganizations", () => {
  const legacyProfile = {
    _id: "main",
    name: "Jahid Hasan",
    education: {
      degree: "BSc in Computer Science and Engineering",
      university: "Metropolitan University, Sylhet",
      graduation: "August 2026",
    },
  };
  const legacyExperience = [
    {
      id: "joint",
      order: 0,
      date: "2023–2024",
      sortYear: 2023,
      category: "leadership",
      title: "Joint Office Secretary",
      organization: "Metropolitan University Sports Club",
      description: "Supported events.",
    },
    {
      id: "organizing",
      order: 1,
      date: "2024–2025",
      sortYear: 2024,
      category: "leadership",
      title: "Organizing Secretary",
      organization: "Metropolitan University Sports Club",
      description: "Coordinated leagues.",
    },
  ];
  const legacyCertification = {
    id: "jobready",
    order: 0,
    title: "Employability Skills",
    issuer: "Wadhwani Foundation",
    category: "professional",
    status: "completed",
    issued: "November 2024",
  };

  it("reports on a dry run, migrates once, then skips", async () => {
    await db.collection("profile").insertOne(legacyProfile);
    await db.collection("experience").insertMany(legacyExperience);
    await db.collection("certifications").insertOne(legacyCertification);

    const dry = await migrateToOrganizations(db, { dryRun: true });
    expect(dry.organizations.map((item) => item.id)).toEqual([
      "metropolitan-university-sports-club",
      "metropolitan-university",
      "wadhwani-foundation",
    ]);
    expect(await db.collection("organizations").countDocuments()).toBe(0);
    expect(await db.collection("experience").countDocuments()).toBe(2);

    await migrateToOrganizations(db);
    const experience = await db.collection("experience").find().toArray();
    expect(experience).toHaveLength(1);
    expect(experience[0].roles.map((role) => role.title)).toEqual([
      "Organizing Secretary",
      "Joint Office Secretary",
    ]);
    const profile = await db.collection("profile").findOne({ _id: "main" });
    expect(profile).not.toHaveProperty("education");
    expect(profile.name).toBe("Jahid Hasan");
    expect(await db.collection("education").findOne()).toEqual(
      expect.objectContaining({ degree: "BSc", end: "2026-08" }),
    );
    expect(await db.collection("certifications").findOne()).toEqual(
      expect.objectContaining({
        organizationId: "wadhwani-foundation",
        issued: "2024-11",
      }),
    );
    expect(
      (await db.collection("learning").findOne({ _id: "main" })).steps,
    ).toHaveLength(4);

    expect(await migrateToOrganizations(db)).toEqual({ skipped: true });
  });
});
