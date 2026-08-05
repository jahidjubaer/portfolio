// Phase 1 has no verified project data source (app/data/projects.ts does not
// exist yet, see Phase 5). This is the only slug the dynamic /work/:slug
// route recognizes for now, used solely to validate framework rendering.
// It must never be presented as a real project.
export const FRAMEWORK_VALIDATION_SLUG = "framework-validation";

export function isKnownProjectSlug(slug: string): boolean {
  return slug === FRAMEWORK_VALIDATION_SLUG;
}
