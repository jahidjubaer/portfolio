import { ArrowUpRight } from "lucide-react";
import { VisuallyHidden } from "../../components/ui/VisuallyHidden";

/**
 * Accessible external project links (live site, repository, documentation).
 * Link text is always descriptive — never "here" or a bare icon.
 * @param {{ links: import("../../data/projects").ProjectLink[], className?: string }} props
 */
export function ProjectLinks({ links, className = "" }) {
  const validLinks = (links ?? []).filter((link) => link.url);
  if (validLinks.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-4 ${className}`}>
      {validLinks.map((link) => (
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
      ))}
    </ul>
  );
}
