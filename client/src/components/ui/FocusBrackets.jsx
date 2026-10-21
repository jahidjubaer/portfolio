import { cn } from "../../lib/cn";

/**
 * The site's "focus lock" mark: four viewfinder corners that snap in
 * around the nearest `.has-brackets` ancestor when it is hovered with a
 * mouse or holds keyboard focus (see `.focus-brackets` in utilities.css).
 * Decoration only. `inside` keeps the corners within the card, for cards
 * that clip their overflow.
 * @param {{ inside?: boolean, className?: string }} props
 */
export function FocusBrackets({ inside = false, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "focus-brackets",
        inside && "focus-brackets-inside",
        className,
      )}
    />
  );
}
