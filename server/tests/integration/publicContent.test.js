import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { closeDb, getDb } from "../../src/db/client.js";
import { seedDatabase } from "../../src/db/seed.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

let mongo;
const content = buildSeedContent();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  env.mongodbUri = mongo.getUri();
  env.mongodbDb = "portfolio-test";
  await seedDatabase(await getDb(), content);
}, 120_000);

afterAll(async () => {
  await closeDb();
  await mongo?.stop();
  env.mongodbUri = "";
});

describe("GET /api/public/*", () => {
  it("returns the profile without Mongo internals", async () => {
    const response = await request(app).get("/api/public/profile");
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Jahid Hasan");
    expect(response.body.data).not.toHaveProperty("_id");
  });

  it("lists projects in order", async () => {
    const response = await request(app).get("/api/public/projects");
    expect(response.status).toBe(200);
    expect(response.body.data.map((project) => project.slug)).toEqual(
      content.projects.map((project) => project.slug),
    );
  });

  it("returns one project by slug, and 404 for an unknown slug", async () => {
    const found = await request(app).get("/api/public/projects/sarabo");
    expect(found.status).toBe(200);
    expect(found.body.data.title).toMatch(/Sarabo/);

    const missing = await request(app).get("/api/public/projects/nope");
    expect(missing.status).toBe(404);
    expect(missing.body).toMatchObject({
      success: false,
      error: "Project not found.",
    });
  });

  it("serves the full snapshot for the build step", async () => {
    const response = await request(app).get("/api/public/content");
    expect(response.status).toBe(200);
    expect(Object.keys(response.body.data).sort()).toEqual(
      [
        "beyond",
        "certifications",
        "education",
        "experience",
        "github",
        "learning",
        "learningTracks",
        "organizations",
        "photos",
        "posts",
        "profile",
        "projects",
        "skills",
      ].sort(),
    );
    expect(response.body.data.certifications).toHaveLength(
      content.certifications.length,
    );
  });

  it("never publishes a grade that isn't marked to show", async () => {
    const db = await getDb();
    const education = db.collection("education");
    const [entry] = content.education;
    await education.updateOne(
      { id: entry.id },
      { $set: { grade: "3.38", showGrade: false } },
    );
    const hidden = await request(app).get("/api/public/content");
    expect(hidden.body.data.education[0]).not.toHaveProperty("grade");

    await education.updateOne({ id: entry.id }, { $set: { showGrade: true } });
    const shown = await request(app).get("/api/public/content");
    expect(shown.body.data.education[0].grade).toBe("3.38");

    await education.updateOne(
      { id: entry.id },
      { $unset: { grade: "", showGrade: "" } },
    );
  });

  it("reports the database as configured in /api/health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.body.database).toBe("configured");
  });
});

describe("seedDatabase", () => {
  it("never overwrites later edits unless asked", async () => {
    const db = await getDb();
    const projects = db.collection("projects");
    await projects.updateOne({ slug: "sarabo" }, { $set: { title: "Edited" } });

    const summary = await seedDatabase(db, content);
    expect(summary.projects.inserted).toBe(0);
    expect((await projects.findOne({ slug: "sarabo" })).title).toBe("Edited");

    await seedDatabase(db, content, { overwrite: true });
    expect((await projects.findOne({ slug: "sarabo" })).title).not.toBe(
      "Edited",
    );
  });
});
