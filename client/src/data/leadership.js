import { experienceGroups } from "./experience";
import { formatRange } from "../lib/dates";

/**
 * Leadership roles for /beyond and the resume, from the leadership
 * entries of the experience list, most recent first.
 * @type {Array<{ organization: string, role: string, dates: string, description: string }>}
 */
export const leadershipRoles = experienceGroups
  .filter((group) => group.category === "leadership")
  .flatMap((group) =>
    group.roles.map((role) => ({
      organization: group.organization.name,
      role: role.title,
      dates: formatRange(role),
      description: role.description ?? "",
    })),
  );
