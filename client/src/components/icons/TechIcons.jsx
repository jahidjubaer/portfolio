import { TECH_LOGOS } from "./tech-logos";

/**
 * A technology logo from tech-logos.js; renders nothing for unknown names.
 * @param {{ name: string, size?: number, className?: string }} props
 */
export function TechLogo({ name, size = 20, className }) {
  const logo = TECH_LOGOS[name];
  if (!logo) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={logo.color ?? "currentColor"}
      className={className}
      aria-hidden="true"
    >
      <path d={logo.path} />
    </svg>
  );
}
