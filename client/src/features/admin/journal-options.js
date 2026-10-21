/** Learning-journal helpers shared by the admin forms (R3). */

export const isPrivate = (item) => item.visibility === "private";

/** The learning tracks as select options, private ones marked. */
export function trackOptions(content) {
  return [...(content.learningTracks ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((track) => ({
      value: track.id,
      label: isPrivate(track) ? `${track.title} (private)` : track.title,
    }));
}

/** Every syllabus topic of a track (or of all tracks), for suggestions. */
export function syllabusTopics(content, trackId) {
  return [
    ...new Set(
      (content.learningTracks ?? [])
        .filter((track) => !trackId || track.id === trackId)
        .flatMap((track) => (track.syllabus ?? []).map((topic) => topic.title)),
    ),
  ];
}
