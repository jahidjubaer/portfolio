import { ArrowUpRight } from "lucide-react";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { cn } from "../../lib/cn";

/**
 * A full-width link to the original site that holds everything the page
 * only samples (the photo journal, the blog). The whole card is one link.
 * @param {{
 *   href: string,
 *   label: string,
 *   description?: string,
 *   icon: import("lucide-react").LucideIcon,
 *   count?: { shown: number, total: number, noun: string },
 *   className?: string,
 * }} props
 */
export function ExternalSiteCard({
  href,
  label,
  description,
  icon: Icon,
  count,
  className,
}) {
  const host = new URL(href).hostname.replace(/^www\./, "");
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "has-brackets group relative flex items-center gap-4 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 transition-colors hover:border-(--color-accent-primary)/60 focus-visible:border-(--color-accent-primary) sm:p-6",
        className,
      )}
    >
      <FocusBrackets inside />
      {/* Soft accent wash in the corner; decoration only. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-(--color-accent-primary-soft) blur-2xl transition-opacity group-hover:opacity-100 motion-safe:opacity-70"
      />
      <span className="relative grid size-12 shrink-0 place-items-center rounded-(--radius-md) border border-(--color-accent-primary)/30 bg-(--color-accent-primary-soft) text-(--color-accent-primary)">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="mono-meta block text-(--color-text-muted)">
          {count && count.total > count.shown
            ? `Showing ${count.shown} of ${count.total} ${count.noun} · `
            : null}
          {host}
        </span>
        <span className="mt-0.5 block text-[1.0625rem] font-semibold text-(--color-text-primary)">
          See everything on {label}
        </span>
        {description ? (
          <span className="mt-1 block text-sm text-(--color-text-secondary)">
            {description}
          </span>
        ) : null}
      </span>
      <ArrowUpRight
        size={22}
        aria-hidden="true"
        className="relative shrink-0 text-(--color-text-muted) transition-transform group-hover:text-(--color-accent-primary) motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
