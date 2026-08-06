import { Reveal } from "../motion/Reveal";

function isEmptyContent(children) {
  if (children === null || children === undefined || children === false)
    return true;
  if (Array.isArray(children)) {
    return children.every((child) => isEmptyContent(child));
  }
  return false;
}

/**
 * A single case-study section. Renders nothing (no empty heading, no
 * empty landmark) when it has no real content.
 * @param {{
 *   id: string,
 *   heading: string,
 *   children: import("react").ReactNode,
 *   className?: string,
 * }} props
 */
export function ProjectSection({ id, heading, children, className = "" }) {
  if (isEmptyContent(children)) return null;

  return (
    <Reveal as="section" className={className}>
      <div id={id} className="scroll-mt-36">
        <h2 className="heading-md text-(--color-text-primary)">{heading}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </Reveal>
  );
}
