/**
 * @param {{ children: import("react").ReactNode, className?: string, as?: string }} props
 */
export function Container({ children, className = "", as: Tag = "div" }) {
  return (
    <Tag className={`mx-auto w-full max-w-6xl px-6 sm:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
