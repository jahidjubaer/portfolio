import { ClampedText } from "../../components/ui/ClampedText";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORKPLACE_LABELS,
} from "../../data/experience";
import { formatDuration, formatRange } from "../../lib/dates";
import { cn } from "../../lib/cn";
import {
  OrganizationLogo,
  OrganizationName,
} from "../organizations/Organization";

const META = "text-sm text-(--color-text-muted)";

/** "2024 – 2025 · 1 yr" */
function datesLine(role) {
  return [formatRange(role), formatDuration(role.start, role.end)]
    .filter(Boolean)
    .join(" · ");
}

/** "Sylhet · On-site" */
function placeLine(role) {
  return [role.location, WORKPLACE_LABELS[role.workplace]]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Everything under a role's title, in LinkedIn's order.
 * @param {{ role: import("../../data/experience").Role, showType: boolean }} props
 */
function RoleDetails({ role, showType }) {
  const place = placeLine(role);
  return (
    <>
      {showType && role.employmentType ? (
        <p className="text-sm text-(--color-text-secondary)">
          {EMPLOYMENT_TYPE_LABELS[role.employmentType]}
        </p>
      ) : null}
      <p className={cn(META, "tabular-nums")}>{datesLine(role)}</p>
      {place ? <p className={META}>{place}</p> : null}
      {role.description ? (
        <ClampedText text={role.description} className="mt-2" />
      ) : null}
      {role.skills?.length ? (
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          <span className="font-semibold text-(--color-text-primary)">
            Skills:
          </span>{" "}
          {role.skills.join(" · ")}
        </p>
      ) : null}
    </>
  );
}

/**
 * One role at one organization: the title leads and the organization
 * sits under it, as LinkedIn shows a single position.
 * @param {{ group: import("../../data/experience").ExperienceGroup, headingLevel: "h3" | "h4" }} props
 */
function SingleRole({ group, headingLevel: Heading }) {
  const [role] = group.roles;
  const type = EMPLOYMENT_TYPE_LABELS[role.employmentType];
  return (
    <div className="flex gap-3.5">
      <OrganizationLogo organization={group.organization} />
      <div className="min-w-0 flex-1">
        <Heading className="font-semibold text-(--color-text-primary)">
          {role.title}
        </Heading>
        <p className="text-[0.9375rem] text-(--color-text-primary)">
          <OrganizationName organization={group.organization} />
          {type ? (
            <span className="text-(--color-text-secondary)"> · {type}</span>
          ) : null}
        </p>
        <RoleDetails role={role} showType={false} />
      </div>
    </div>
  );
}

/**
 * Several roles at one organization: the organization is written once
 * with its total time, and the roles hang off a rail under its logo. The
 * rail joins roles of this organization only, never the next one.
 * @param {{ group: import("../../data/experience").ExperienceGroup, headingLevel: "h3" | "h4" }} props
 */
function RoleGroup({ group, headingLevel: Heading }) {
  const RoleHeading = Heading === "h3" ? "h4" : "h5";
  const summary = [group.totalDuration, group.organization.location]
    .filter(Boolean)
    .join(" · ");
  return (
    <div>
      <div className="flex gap-3.5">
        <OrganizationLogo organization={group.organization} />
        <div className="min-w-0 flex-1 self-center">
          <Heading className="font-semibold text-(--color-text-primary)">
            <OrganizationName organization={group.organization} />
          </Heading>
          {summary ? <p className={META}>{summary}</p> : null}
        </div>
      </div>
      <ol className="mt-3">
        {group.roles.map((role, index) => (
          <li
            key={`${role.title}-${role.start}`}
            className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-3.5 pb-5 last:pb-0"
          >
            <span aria-hidden="true" className="relative flex justify-center">
              <span className="mt-1.5 size-2 rounded-full bg-(--color-border-strong)" />
              {index < group.roles.length - 1 ? (
                // Runs through the li's bottom padding to the next dot.
                <span className="absolute top-4 -bottom-6 w-px bg-(--color-border-strong)" />
              ) : null}
            </span>
            <div className="min-w-0">
              <RoleHeading className="font-semibold text-(--color-text-primary)">
                {role.title}
              </RoleHeading>
              <RoleDetails role={role} showType />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Experience in LinkedIn's layout: one block per organization, separated
 * by a rule. Organizations are never joined to each other by a line.
 * @param {{ groups: import("../../data/experience").ExperienceGroup[], headingLevel?: "h3" | "h4" }} props
 */
export function ExperienceList({ groups, headingLevel = "h3" }) {
  return (
    <ul className="divide-y divide-(--color-border)">
      {groups.map((group) => (
        <li key={group.id} className="py-5 first:pt-0 last:pb-0">
          {group.roles.length > 1 ? (
            <RoleGroup group={group} headingLevel={headingLevel} />
          ) : (
            <SingleRole group={group} headingLevel={headingLevel} />
          )}
        </li>
      ))}
    </ul>
  );
}
