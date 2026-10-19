import { experience as storedExperience } from "../generated/content.json";
import { getOrganization } from "./organizations";
import { byRecency, byStartRecency, formatDuration } from "../lib/dates";

/**
 * @typedef {{
 *   title: string,
 *   employmentType?: string,
 *   start: string,
 *   end?: string,
 *   current?: boolean,
 *   location?: string,
 *   workplace?: "on-site" | "hybrid" | "remote",
 *   description?: string,
 *   skills?: string[],
 * }} Role
 *
 * @typedef {{
 *   id: string,
 *   category: "work" | "leadership" | "community",
 *   organization: import("./organizations").Organization,
 *   roles: Role[],
 *   span: { start: string, end?: string, current: boolean },
 *   totalDuration: string | null,
 * }} ExperienceGroup
 */

export const EMPLOYMENT_TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
  freelance: "Freelance",
  "self-employed": "Self-employed",
  volunteer: "Volunteer",
};

export const WORKPLACE_LABELS = {
  "on-site": "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

/**
 * One stored experience entry, ready to render. Shared with the admin's
 * live preview, which passes its own organization lookup.
 * @param {Record<string, any>} entry
 * @param {(id: string) => import("./organizations").Organization} findOrganization
 * @returns {ExperienceGroup}
 */
export function buildExperienceGroup(entry, findOrganization) {
  const roles = [...entry.roles].sort(byStartRecency);
  const current = roles.some((role) => role.current);
  const start = roles.map((role) => role.start).sort()[0];
  const end = current
    ? undefined
    : roles
        .map((role) => role.end)
        .sort()
        .at(-1);
  return {
    id: entry.id,
    category: entry.category,
    organization: findOrganization(entry.organizationId),
    roles,
    span: { start, end, current },
    totalDuration: formatDuration(start, end),
  };
}

/**
 * Experience grouped the way LinkedIn shows it: one entry per
 * organization with its roles, most recent organization and role first.
 * @type {ExperienceGroup[]}
 */
export const experienceGroups = storedExperience
  .map((entry) => buildExperienceGroup(entry, getOrganization))
  .sort((a, b) => byRecency(a.span, b.span));
