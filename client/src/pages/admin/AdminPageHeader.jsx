import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * Title block for an admin page, with an optional back link.
 * @param {{ title: string, description?: string, backTo?: string, backLabel?: string, actions?: import("react").ReactNode }} props
 */
export function AdminPageHeader({
  title,
  description,
  backTo,
  backLabel,
  actions,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {backTo ? (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-[1.5rem] font-bold tracking-[-0.02em] text-(--color-text-primary)">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[0.9375rem] text-(--color-text-secondary)">
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
