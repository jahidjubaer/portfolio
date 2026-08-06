/**
 * @param {{ children: import("react").ReactNode, className?: string }} props
 */
export function SectionLabel({ children, className = "" }) {
  return (
    <p
      className={`font-mono text-xs font-semibold tracking-[0.2em] text-(--color-accent) uppercase ${className}`}
    >
      {children}
    </p>
  );
}
