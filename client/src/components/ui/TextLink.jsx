import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

const BASE_CLASSES =
  "text-(--color-accent-primary) underline-offset-4 hover:underline focus-visible:underline";

/**
 * @param {{
 *   to?: string,
 *   href?: string,
 *   children: import("react").ReactNode,
 *   className?: string,
 * } & import("react").AnchorHTMLAttributes<HTMLAnchorElement>} props
 */
export function TextLink({ to, href, children, className = "", ...rest }) {
  const classes = cn(BASE_CLASSES, className);

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
