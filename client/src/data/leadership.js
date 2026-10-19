import { timelineEvents } from "./timeline";

/**
 * Leadership roles for /beyond and the resume, derived from the
 * leadership entries of the experience timeline (their longer `details`
 * write-up when there is one), most recent first.
 * @type {Array<{ organization: string, role: string, dates: string, description: string }>}
 */
export const leadershipRoles = [...timelineEvents]
  .reverse()
  .filter((event) => event.category === "leadership")
  .map((event) => ({
    organization: event.organization,
    role: event.title,
    dates: event.date,
    description: event.details ?? event.description,
  }));
