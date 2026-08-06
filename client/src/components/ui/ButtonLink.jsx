import { Link } from "react-router-dom";
import { getButtonClasses } from "./button-styles";

/**
 * Link-flavored counterpart to Button — same visual variants/sizes, but
 * renders an <a> or React Router <Link> instead of a <button>, so it stays
 * semantically correct for navigation actions.
 * @param {{
 *   to?: string,
 *   href?: string,
 *   variant?: "primary" | "secondary" | "ghost" | "text",
 *   size?: "sm" | "md" | "lg",
 *   disabled?: boolean,
 *   leadingIcon?: import("react").ReactNode,
 *   trailingIcon?: import("react").ReactNode,
 *   children: import("react").ReactNode,
 *   className?: string,
 * } & import("react").AnchorHTMLAttributes<HTMLAnchorElement>} props
 */
export function ButtonLink({
  to,
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  leadingIcon,
  trailingIcon,
  children,
  className = "",
  ...rest
}) {
  const classes = getButtonClasses({ variant, size, disabled, className });
  const content = (
    <>
      {leadingIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {leadingIcon}
        </span>
      ) : null}
      {children}
      {trailingIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true">
        {content}
      </span>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  );
}
