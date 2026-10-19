import { ClampedText } from "../../components/ui/ClampedText";
import { degreeLine } from "../../data/education";
import { formatRange } from "../../lib/dates";
import {
  OrganizationLogo,
  OrganizationName,
} from "../organizations/Organization";

/**
 * Education entries in LinkedIn's layout: school, degree and field,
 * dates, then grade, activities, description, and skills when present.
 * @param {{ entries: import("../../data/education").EducationEntry[], headingLevel?: "h3" | "h4" }} props
 */
export function EducationList({ entries, headingLevel: Heading = "h3" }) {
  return (
    <ul className="divide-y divide-(--color-border)">
      {entries.map((entry) => {
        const dates = formatRange(entry);
        return (
          <li key={entry.id} className="flex gap-3.5 py-5 first:pt-0 last:pb-0">
            <OrganizationLogo organization={entry.organization} />
            <div className="min-w-0 flex-1">
              <Heading className="font-semibold text-(--color-text-primary)">
                <OrganizationName organization={entry.organization} />
              </Heading>
              <p className="text-[0.9375rem] text-(--color-text-primary)">
                {degreeLine(entry)}
              </p>
              {dates ? (
                <p className="text-sm text-(--color-text-muted) tabular-nums">
                  {dates}
                </p>
              ) : null}
              {entry.grade ? (
                <p className="mt-1.5 text-sm text-(--color-text-secondary)">
                  Grade: {entry.grade}
                </p>
              ) : null}
              {entry.activities ? (
                <p className="mt-1.5 text-sm text-(--color-text-secondary)">
                  Activities and societies: {entry.activities}
                </p>
              ) : null}
              {entry.description ? (
                <ClampedText text={entry.description} className="mt-2" />
              ) : null}
              {entry.skills?.length ? (
                <p className="mt-2 text-sm text-(--color-text-secondary)">
                  <span className="font-semibold text-(--color-text-primary)">
                    Skills:
                  </span>{" "}
                  {entry.skills.join(" · ")}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
