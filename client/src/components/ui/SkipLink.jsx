/**
 * @param {{ targetId: string, children: import("react").ReactNode }} props
 */
export function SkipLink({ targetId, children = "Skip to main content" }) {
  return (
    <a className="skip-link" href={`#${targetId}`}>
      {children}
    </a>
  );
}
