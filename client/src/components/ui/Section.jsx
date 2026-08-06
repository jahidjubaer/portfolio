import { cn } from "../../lib/cn";
import { Container } from "./Container";

/**
 * Standard section wrapper: vertical rhythm + optional bottom rule +
 * optional background surface. Most homepage/route sections should use
 * this instead of hand-rolling padding classes.
 * @param {{
 *   children: import("react").ReactNode,
 *   className?: string,
 *   containerClassName?: string,
 *   bordered?: boolean,
 *   surface?: boolean,
 *   as?: keyof JSX.IntrinsicElements,
 * } & import("react").HTMLAttributes<HTMLElement>} props
 */
export function Section({
  children,
  className = "",
  containerClassName = "",
  bordered = false,
  surface = false,
  as: Tag = "section",
  ...rest
}) {
  return (
    <Tag
      className={cn(
        "section-spacing",
        bordered && "border-b border-(--color-border)",
        surface && "bg-(--color-surface)",
        className,
      )}
      {...rest}
    >
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}
