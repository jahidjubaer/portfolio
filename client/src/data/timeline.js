import { profile } from "./profile";

function extractYear(text) {
  const match = text.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

/**
 * @typedef {{
 *   id: string,
 *   date: string,
 *   sortYear: number,
 *   category: "education" | "leadership" | "community",
 *   title: string,
 *   organization: string,
 *   description: string,
 * }} TimelineEvent
 */

/**
 * Only verified, dated facts — see CONTENT_CHECKLIST.md sections 9 and 10.
 * Organization/role/date values here match client/src/data/leadership.js
 * and client/src/data/profile.js exactly; descriptions are condensed
 * specifically for a compact timeline card (the full leadership
 * descriptions remain on /about and /beyond).
 *
 * Sarabo and total problems solved are deliberately excluded from this
 * dated timeline: CONTENT_CHECKLIST.md records Sarabo's build year as "not
 * confirmed", and problem-solving has no date at all — neither can be
 * placed on a chronological timeline without inventing a date.
 * @type {TimelineEvent[]}
 */
export const timelineEvents = [
  {
    id: "rcy-volunteering",
    date: "2019–2021",
    sortYear: 2019,
    category: "community",
    title: "Volunteer",
    organization: "Red Crescent Youth (RCY)",
    description: "Community volunteering with Red Crescent Youth.",
  },
  {
    id: "sports-club-joint-secretary",
    date: "2023–2024",
    sortYear: 2023,
    category: "leadership",
    title: "Joint Office Secretary",
    organization: "Metropolitan University Sports Club",
    description:
      "Supported event planning and team leadership across university sports programs.",
  },
  {
    id: "sports-club-organizing-secretary",
    date: "2024–2025",
    sortYear: 2024,
    category: "leadership",
    title: "Organizing Secretary",
    organization: "Metropolitan University Sports Club",
    description:
      "Coordinated university cricket, football, indoor games, and badminton leagues.",
  },
  {
    id: "photographic-society-organizing-secretary",
    date: "2024–2025",
    sortYear: 2024,
    category: "leadership",
    title: "Organizing Secretary",
    organization: "Metropolitan University Photographic Society",
    description: "Organized photo walks and university photography coverage.",
  },
  {
    id: "graduation",
    date: profile.education.graduation,
    sortYear: extractYear(profile.education.graduation),
    category: "education",
    title: "Graduation",
    organization: profile.education.university,
    description: profile.education.degree,
  },
].sort((a, b) => a.sortYear - b.sortYear);

export const TIMELINE_CATEGORY_LABELS = {
  education: "Education",
  leadership: "Leadership",
  community: "Community",
};
