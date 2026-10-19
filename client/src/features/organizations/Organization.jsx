import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";

const SIZES = {
  md: "size-12 text-[0.9375rem]",
  sm: "size-10 text-sm",
};

const SKIP_WORDS = new Set(["of", "the", "and", "for", "&"]);

/** "Metropolitan University Sports Club" → "MU" */
function initials(name) {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/[\s,]+/)
    .filter((word) => word && !SKIP_WORDS.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * The organization's uploaded logo, or an initials tile until one is
 * added in the admin. Decorative: the name always sits next to it.
 * @param {{ organization: import("../../data/organizations").Organization, size?: "md" | "sm", className?: string }} props
 */
export function OrganizationLogo({ organization, size = "md", className }) {
  const frame = cn(
    "grid shrink-0 place-items-center overflow-hidden rounded-(--radius-sm) border border-(--color-border)",
    SIZES[size],
    className,
  );
  if (organization.logo) {
    return (
      <span className={cn(frame, "bg-white")}>
        <img
          src={organization.logo.url}
          width={organization.logo.width}
          height={organization.logo.height}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        frame,
        "bg-(--color-surface-soft) font-semibold text-(--color-text-secondary)",
      )}
    >
      {initials(organization.name)}
    </span>
  );
}

/**
 * The organization's name, linked to its site when there is one.
 * @param {{ organization: import("../../data/organizations").Organization, className?: string }} props
 */
export function OrganizationName({ organization, className }) {
  if (!organization.url) {
    return <span className={className}>{organization.name}</span>;
  }
  return (
    <a
      href={organization.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "underline-offset-4 hover:text-(--color-accent-primary) hover:underline",
        className,
      )}
    >
      {organization.name}
      <ArrowUpRight
        size={14}
        aria-hidden="true"
        className="ml-0.5 inline-block align-[-0.1em] opacity-60"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
