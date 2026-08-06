import { cn } from "../../lib/cn";
import { SectionLabel } from "./SectionLabel";

/**
 * @param {{
 *   label?: string,
 *   heading: import("react").ReactNode,
 *   description?: import("react").ReactNode,
 *   as?: "h1" | "h2" | "h3",
 *   className?: string,
 * }} props
 */
export function SectionHeader({
  label,
  heading,
  description,
  as: HeadingTag = "h2",
  className = "",
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <HeadingTag className="heading-xl mt-3 text-(--color-text-primary)">
        {heading}
      </HeadingTag>
      {description ? (
        <p className="body-md mt-4 text-(--color-text-secondary)">
          {description}
        </p>
      ) : null}
    </div>
  );
}
