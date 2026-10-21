/**
 * The five sections every case study uses (docs/14, R2), in order. The
 * admin shows each `hint` under the section, the AI draft fills them, and
 * the site hides any that are still blank.
 */
export const CASE_STUDY_TEMPLATE = [
  {
    id: "problem",
    heading: "Problem",
    hint: "Who it's for and what was hard for them, in 2–3 sentences.",
  },
  {
    id: "what-i-built",
    heading: "What I built",
    hint: "The features that matter, as up to 5 bullets.",
  },
  {
    id: "how-it-works",
    heading: "How it works",
    hint: "The architecture in about 3 lines. Set the type to Architecture diagram if the project has one.",
  },
  {
    id: "hard-part",
    heading: "The hard part",
    hint: "One real technical problem and how you solved it.",
  },
  {
    id: "result",
    heading: "Result and next",
    hint: "What works today, and what you'd do next. No invented numbers.",
  },
];

/** The template as blank text sections, for a new case study. */
export function blankTemplateSections() {
  return CASE_STUDY_TEMPLATE.map(({ id, heading }) => ({
    id,
    heading,
    type: "text",
    body: "",
  }));
}

/** @param {string | undefined} id */
export function templateHint(id) {
  return CASE_STUDY_TEMPLATE.find((section) => section.id === id)?.hint;
}
