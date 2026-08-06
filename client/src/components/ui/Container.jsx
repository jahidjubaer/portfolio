import { cn } from "../../lib/cn";

/**
 * @param {{ children: import("react").ReactNode, className?: string, as?: string }} props
 */
export function Container({ children, className = "", as: Tag = "div" }) {
  return <Tag className={cn("content-container", className)}>{children}</Tag>;
}
