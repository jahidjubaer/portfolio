const WORDS_PER_MINUTE = 180;

function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates reading time for a case study in minutes, from its section
 * text (Markdown syntax adds a negligible handful of "words").
 * @param {import("../data/projects").CaseStudy} caseStudy
 * @returns {number}
 */
export function estimateReadTime(caseStudy) {
  const totalWords = (caseStudy.sections ?? []).reduce(
    (sum, section) => sum + countWords(section.body),
    0,
  );
  return Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));
}
