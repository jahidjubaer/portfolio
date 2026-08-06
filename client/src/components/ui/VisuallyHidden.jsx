/**
 * Hides content visually while keeping it available to assistive tech.
 * @param {{ children: import("react").ReactNode, as?: keyof JSX.IntrinsicElements }} props
 */
export function VisuallyHidden({ children, as: Tag = "span" }) {
  return <Tag className="sr-only">{children}</Tag>;
}
