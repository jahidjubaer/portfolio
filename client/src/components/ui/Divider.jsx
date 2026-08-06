import { cn } from "../../lib/cn";

/**
 * @param {{ className?: string, orientation?: "horizontal" | "vertical" }} props
 */
export function Divider({ className = "", orientation = "horizontal" }) {
  return (
    <hr
      className={cn(
        "border-(--color-border)",
        orientation === "horizontal" ? "w-full border-t" : "h-full border-l",
        className,
      )}
    />
  );
}
