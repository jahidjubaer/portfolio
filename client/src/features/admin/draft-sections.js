/**
 * Case-study sections after a draft: written sections are kept as they
 * are, blank ones take the draft's text for the same section, and draft
 * sections the form doesn't have yet are added at the end.
 * @param {Array<{ id?: string, body?: string }>} current
 * @param {Array<{ id: string, body?: string }>} drafted
 */
export function mergeDraftSections(current, drafted) {
  const byId = new Map(drafted.map((section) => [section.id, section]));
  const merged = current.map((section) =>
    section.body?.trim() || !byId.get(section.id)?.body
      ? section
      : { ...section, body: byId.get(section.id).body },
  );
  const ids = new Set(current.map((section) => section.id));
  return [...merged, ...drafted.filter((section) => !ids.has(section.id))];
}
