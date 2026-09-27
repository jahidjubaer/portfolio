import { ArrowUpRight } from "lucide-react";
import { VisuallyHidden } from "../../components/ui/VisuallyHidden";
import { ButtonLink } from "../../components/ui/ButtonLink";

/**
 * Accessible external project links (live site, repository, documentation).
 * Link text is always descriptive — never "here" or a bare icon.
 * The first "live" link is rendered as a primary button; the rest as text links.
 * @param {{ links: import("../../data/projects").ProjectLink[], className?: string }} props
 */
export function ProjectLinks({ links, className = "" }) {
  const validLinks = (links ?? []).filter((link) => link.url);
  if (validLinks.length === 0) return null;

  const [primaryLink, ...secondaryLinks] = validLinks;
  const isLivePrimary = primaryLink.type === "live";

  return (
    <ul className={`flex flex-wrap items-center gap-4 ${className}`}>
      {isLivePrimary ? (
        <li>
          <ButtonLink
            href={primaryLink.url}
            variant="primary"
            size="sm"
            trailingIcon={<ArrowUpRight size={14} />}
          >
            {primaryLink.label}
          </ButtonLink>
          <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
        </li>
      ) : null}
      {(!isLivePrimary ? [primaryLink, ...secondaryLinks] : secondaryLinks).map(
        (link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-(--color-accent-secondary) hover:underline"
            >
              {link.label}
              <ArrowUpRight aria-hidden="true" size={14} />
              <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
            </a>
          </li>
        ),
      )}
    </ul>
  );
}
