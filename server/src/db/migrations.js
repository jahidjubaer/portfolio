import { COLLECTIONS } from "./collections.js";
import { caseStudySchema } from "../schemas/content.js";

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
