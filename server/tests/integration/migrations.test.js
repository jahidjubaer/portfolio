import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { migrateCaseStudies } from "../../src/db/migrations.js";
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
