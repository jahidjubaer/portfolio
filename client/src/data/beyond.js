import { beyond } from "../generated/content.json";

/**
 * Beyond-the-code content, edited in the admin panel and read from the
 * published content snapshot. Only confirmed involvement is listed — no
 * statistics, trophies, or dates are invented.
 */
export const sportsHighlights = beyond.sports;

export const volunteeringHighlights = beyond.volunteering;

/** @type {Array<{ name: string, level: string }>} */
export const languages = beyond.languages ?? [];

/** @type {string[]} */
export const interests = beyond.interests ?? [];
