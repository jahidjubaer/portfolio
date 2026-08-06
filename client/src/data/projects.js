/**
 * Real project entries will be added here in Phase 5 (see
 * docs/05-implementation-roadmap.md). Each entry will be looked up by
 * `slug` from ProjectDetailsPage. Until then this list stays empty so
 * every /work/:slug request renders the controlled not-found state.
 *
 * @type {Array<{ slug: string, title: string }>}
 */
export const projects = [];

export function findProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug) ?? null;
}
