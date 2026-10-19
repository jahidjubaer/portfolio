import { experience } from "../generated/content.json";

/**
 * @typedef {{
 *   id: string,
 *   date: string,
 *   sortYear: number,
 *   category: "education" | "leadership" | "community" | "work",
 *   title: string,
 *   organization: string,
 *   description: string,
 *   details?: string,
 * }} TimelineEvent
 */

/**
 * Dated experience entries in the order set in the admin panel, from the
 * published content snapshot. Only verified, dated facts belong here —
 * anything without a confirmed date stays off the timeline.
 * @type {TimelineEvent[]}
 */
export const timelineEvents = [...experience].sort((a, b) => a.order - b.order);

export const TIMELINE_CATEGORY_LABELS = {
  education: "Education",
  leadership: "Leadership",
  community: "Community",
  work: "Work",
};
