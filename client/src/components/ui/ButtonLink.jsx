import { Link } from "react-router-dom";

const VARIANT_CLASSES = {
  primary:
    "bg-(--color-accent) text-[#06210a] hover:brightness-110 border border-transparent",
  secondary:
    "bg-transparent text-(--color-text) border border-(--color-border) hover:border-(--color-accent) hover:text-(--color-accent)",
  ghost:
    "bg-transparent text-(--color-text-muted) border border-transparent hover:text-(--color-text)",
};

const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-150";

/**
 * @param {{
 *   to?: string,
 *   href?: string,
 *   variant?: "primary" | "secondary" | "ghost",
 *   disabled?: boolean,
 *   children: import("react").ReactNode,
 *   className?: string,
 * }} props
 */
export function ButtonLink({
  to,
  href,
  variant = "primary",
  disabled = false,
  children,
  className = "",
  ...rest
}) {
  const classes =
    `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`.trim();

  if (disabled) {
    return (
      <span
        className={`${classes} cursor-not-allowed opacity-50`}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
