import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { formatYearMonth } from "../../lib/dates";
import {
  OrganizationLogo,
  OrganizationName,
} from "../organizations/Organization";

/** "Issued Nov 2024 · Expires Nov 2027" */
function issuedLine(item) {
  return [
    item.issued ? `Issued ${formatYearMonth(item.issued)}` : null,
    item.expires ? `Expires ${formatYearMonth(item.expires)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * @param {{ item: import("../../data/certifications").Certification, headingLevel: "h3" | "h4" }} props
 */
function CertificationItem({ item, headingLevel: Heading }) {
  const issued = issuedLine(item);
  return (
    <li className="flex gap-3.5 py-5 first:pt-0 last:pb-0">
      <OrganizationLogo organization={item.organization} />
      <div className="min-w-0 flex-1">
        <Heading className="font-semibold text-(--color-text-primary)">
          {item.title}
        </Heading>
        <p className="text-[0.9375rem] text-(--color-text-primary)">
          <OrganizationName organization={item.organization} />
        </p>
        {item.status === "in-progress" ? (
          <p className="mt-1">
            <span className="rounded-full border border-dashed border-(--color-border-strong) px-2 py-0.5 text-sm text-(--color-text-secondary)">
              In progress
            </span>
          </p>
        ) : null}
        {issued ? (
          <p className="text-sm text-(--color-text-muted) tabular-nums">
            {issued}
          </p>
        ) : null}
        {item.credentialId ? (
          <p className="text-sm text-(--color-text-muted)">
            Credential ID {item.credentialId}
          </p>
        ) : null}
        {item.description ? (
          <p className="mt-2 text-[0.9375rem] text-(--color-text-secondary)">
            {item.description}
          </p>
        ) : null}
        {item.skills?.length ? (
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            <span className="font-semibold text-(--color-text-primary)">
              Skills:
            </span>{" "}
            {item.skills.join(" · ")}
          </p>
        ) : null}
        {item.credentialUrl ? (
          <ButtonLink
            href={item.credentialUrl}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="sm"
            trailingIcon={<ArrowUpRight size={15} />}
            className="mt-3"
          >
            Show credential
            <span className="sr-only">
              {" "}
              for {item.title} (opens in a new tab)
            </span>
          </ButtonLink>
        ) : null}
        {item.image ? (
          <a
            href={item.image.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block w-44 overflow-hidden rounded-(--radius-sm) border border-(--color-border) hover:border-(--color-border-strong)"
          >
            <img
              src={item.image.url}
              width={item.image.width}
              height={item.image.height}
              alt={item.imageAlt}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
            <span className="sr-only"> (full size, opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Licenses, certifications, and courses in LinkedIn's layout.
 * @param {{ items: import("../../data/certifications").Certification[], headingLevel?: "h3" | "h4" }} props
 */
export function CertificationList({ items, headingLevel = "h3" }) {
  return (
    <ul className="divide-y divide-(--color-border)">
      {items.map((item) => (
        <CertificationItem
          key={item.id}
          item={item}
          headingLevel={headingLevel}
        />
      ))}
    </ul>
  );
}
