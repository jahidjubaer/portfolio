const WORDS_PER_MINUTE = 180;

function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates reading time for a case study in minutes.
 * @param {import("../data/projects").CaseStudy} caseStudy
 * @returns {number}
 */
export function estimateReadTime(caseStudy) {
  const fields = [
    caseStudy.overview,
    caseStudy.responsibility,
    caseStudy.workflow,
    caseStudy.challenge,
    caseStudy.outcome,
    caseStudy.reflection,
  ];

  let totalWords = fields.reduce((sum, field) => sum + countWords(field), 0);

  totalWords += (caseStudy.capabilities?.length ?? 0) * 4;
  totalWords += (caseStudy.decisions?.length ?? 0) * 12;
  totalWords += (caseStudy.architecture?.length ?? 0) * 10;
  totalWords += (caseStudy.roles?.length ?? 0) * 8;

  const minutes = Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));
  return minutes;
}
