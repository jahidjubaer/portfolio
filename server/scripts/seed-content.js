/**
 * Builds the initial database content from the client's hand-written data
 * files (client/src/data/*), the source of truth until the admin panel
 * takes over. Those modules use Vite-style extensionless imports, so this
 * file runs under vite-node (see the "seed" script), not plain node.
 */
import { profile, socialProfiles } from "../../client/src/data/profile.js";
import { projects } from "../../client/src/data/projects.js";
import { timelineEvents } from "../../client/src/data/timeline.js";
import { leadershipRoles } from "../../client/src/data/leadership.js";
import { capabilityGroups } from "../../client/src/data/capabilities.js";
import { certifications } from "../../client/src/data/certifications.js";
import {
  sportsHighlights,
  volunteeringHighlights,
} from "../../client/src/data/beyond.js";
import { contentSchema } from "../src/schemas/content.js";

function withOrder(items) {
  return items.map((item, index) => ({ ...item, order: index }));
}

function findLeadershipDetails(event) {
  return leadershipRoles.find(
    (role) =>
      role.organization === event.organization && role.role === event.title,
  )?.description;
}

/** @returns {import("zod").infer<typeof contentSchema>} */
export function buildSeedContent() {
  // `resume.available` is derived from the asset manifest at build time,
  // so only the stored facts move to the database.
  const { resume, ...profileFields } = profile;

  const content = {
    profile: {
      ...profileFields,
      resume: {
        filename: resume.filename,
        url: resume.url,
        updatedLabel: resume.updatedLabel,
      },
      socialProfiles,
    },
    projects: withOrder(projects),
    experience: withOrder(
      timelineEvents.map((event) => {
        const details = findLeadershipDetails(event);
        return details ? { ...event, details } : event;
      }),
    ),
    skills: withOrder(capabilityGroups),
    certifications: withOrder(certifications),
    beyond: {
      sports: sportsHighlights,
      volunteering: volunteeringHighlights,
    },
    // Added in the admin; Blogger content is imported separately (R8).
    photos: [],
    posts: [],
  };

  return contentSchema.parse(content);
}
