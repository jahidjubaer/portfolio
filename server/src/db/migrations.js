import { COLLECTIONS, SINGLETON_ID, ensureIndexes } from "./collections.js";
import { upgradeContent } from "./content-upgrade.js";
import {
  caseStudySchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  findBrokenReferences,
  learningSchema,
  organizationSchema,
} from "../schemas/content.js";

/**
 * R5b changed case studies from fixed fields (overview, roles, workflow…)
 * to Markdown sections. Projects still holding the old shape get the
 * converted version from the seed; the rest are reported for a manual
 * edit. Projects already in the new shape are never touched, so this is
 * safe to re-run.
 * @param {import("mongodb").Db} db
 * @param {Array<{ slug: string, caseStudy: unknown }>} seedProjects
 * @param {{ dryRun?: boolean }} [options]
 * @returns {Promise<{ converted: string[], manual: string[] }>}
 */
export async function migrateCaseStudies(
  db,
  seedProjects,
  { dryRun = false } = {},
) {
  const collection = db.collection(COLLECTIONS.projects);
  const stored = await collection
    .find(
      { caseStudy: { $ne: null } },
      { projection: { slug: 1, caseStudy: 1 } },
    )
    .toArray();
  const converted = [];
  const manual = [];

  for (const project of stored) {
    if (caseStudySchema.safeParse(project.caseStudy).success) continue;
    const seed = seedProjects.find((entry) => entry.slug === project.slug);
    if (!seed?.caseStudy) {
      manual.push(project.slug);
      continue;
    }
    converted.push(project.slug);
    if (!dryRun) {
      await collection.updateOne(
        { slug: project.slug },
        { $set: { caseStudy: seed.caseStudy } },
      );
    }
  }
  return { converted, manual };
}

/**
 * P2 (docs/09): organizations, one experience entry per organization with
 * its roles, education out of the profile, certifications pointing at
 * organizations, and the Learning page's data. Runs the same
 * `upgradeContent` that produced the committed snapshot, validates every
 * resulting document first, and skips once organizations exist, so it is
 * safe to re-run.
 * @param {import("mongodb").Db} db
 * @param {{ dryRun?: boolean }} [options]
 */
export async function migrateToOrganizations(db, { dryRun = false } = {}) {
  const collection = (name) => db.collection(COLLECTIONS[name]);
  if ((await collection("organizations").countDocuments()) > 0) {
    return { skipped: true };
  }
  const hideId = { projection: { _id: 0 } };
  const [profile, experience, certifications, learning] = await Promise.all([
    collection("profile").findOne({ _id: SINGLETON_ID }, hideId),
    collection("experience").find({}, hideId).toArray(),
    collection("certifications").find({}, hideId).toArray(),
    collection("learning").findOne({ _id: SINGLETON_ID }, hideId),
  ]);
  if (!profile) throw new Error("No profile in the database; seed it first.");

  const upgraded = upgradeContent({
    profile,
    experience,
    certifications,
    ...(learning ? { learning } : {}),
  });
  const parse = (schema, value) => schema.parse(value);
  upgraded.organizations.forEach((item) => parse(organizationSchema, item));
  upgraded.experience.forEach((item) => parse(experienceSchema, item));
  upgraded.education.forEach((item) => parse(educationSchema, item));
  upgraded.certifications.forEach((item) => parse(certificationSchema, item));
  parse(learningSchema, upgraded.learning);
  const broken = findBrokenReferences(upgraded);
  if (broken.length) throw new Error(broken[0].message);

  if (!dryRun) {
    await ensureIndexes(db);
    await collection("organizations").insertMany(
      upgraded.organizations.map((item) => ({ ...item })),
    );
    await collection("experience").deleteMany({});
    await collection("experience").insertMany(
      upgraded.experience.map((item) => ({ ...item })),
    );
    if (upgraded.education.length) {
      await collection("education").insertMany(
        upgraded.education.map((item) => ({ ...item })),
      );
    }
    await collection("certifications").bulkWrite(
      upgraded.certifications.map((item) => ({
        replaceOne: { filter: { id: item.id }, replacement: item },
      })),
    );
    await collection("profile").updateOne(
      { _id: SINGLETON_ID },
      { $unset: { education: "" } },
    );
    await collection("learning").updateOne(
      { _id: SINGLETON_ID },
      { $setOnInsert: upgraded.learning },
      { upsert: true },
    );
  }
  return { skipped: false, ...upgraded };
}
