import { Tag } from "../../components/ui/Tag";

/**
 * Renders a project's technology stack as a tag list.
 * @param {{ stack: string[], className?: string }} props
 */
export function ProjectStack({ stack, className = "" }) {
  if (!stack || stack.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {stack.map((tech) => (
        <li key={tech}>
          <Tag>{tech}</Tag>
        </li>
      ))}
    </ul>
  );
}
