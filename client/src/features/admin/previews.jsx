import { buildExperienceGroup } from "../../data/experience";
import { resolveEducation } from "../../data/education";
import { resolveCertification } from "../../data/certifications";
import { resolveTrack } from "../../data/learning";
import { ExperienceList } from "../experience/ExperienceList";
import { EducationList } from "../credentials/EducationList";
import { CertificationList } from "../credentials/CertificationList";
import { LearningTrackCard } from "../learning-tracks/LearningTrackCard";
import {
  OrganizationLogo,
  OrganizationName,
} from "../organizations/Organization";

/**
 * Live previews for the item editor: the unsaved form values rendered by
 * the same components the public site uses, so what you see is what
 * visitors get. Lookups go through the admin's content, not the published
 * snapshot, so a new organization shows up straight away.
 */

const UNCHOSEN = { id: "", name: "Choose an organization" };

function organizationFinder(content) {
  return (id) =>
    (content.organizations ?? []).find((item) => item.id === id) ?? UNCHOSEN;
}

/** Roles still being typed are skipped until they have a title. */
function typedRoles(roles) {
  return (roles ?? []).filter((role) => role.title);
}

export const PREVIEWS = {
  organizations: (value) => {
    const organization = { ...value, name: value.name || "Name" };
    return (
      <div className="flex items-center gap-3.5">
        <OrganizationLogo organization={organization} />
        <span className="font-semibold text-(--color-text-primary)">
          <OrganizationName organization={organization} />
        </span>
      </div>
    );
  },
  experience: (value, content) => {
    const roles = typedRoles(value.roles);
    if (roles.length === 0) return null;
    const group = buildExperienceGroup(
      { ...value, roles },
      organizationFinder(content),
    );
    return <ExperienceList groups={[group]} />;
  },
  education: (value, content) =>
    value.degree ? (
      <EducationList
        entries={[resolveEducation(value, organizationFinder(content))]}
      />
    ) : null,
  certifications: (value, content) =>
    value.title ? (
      <CertificationList
        items={[resolveCertification(value, organizationFinder(content))]}
      />
    ) : null,
  learningTracks: (value, content) => {
    if (!value.title) return null;
    const findOrganization = organizationFinder(content);
    const track = resolveTrack(value, {
      findOrganization,
      findCertification: (id) => {
        const stored = (content.certifications ?? []).find(
          (item) => item.id === id,
        );
        return stored && resolveCertification(stored, findOrganization);
      },
      projectList: content.projects ?? [],
    });
    return <LearningTrackCard track={track} />;
  },
};
