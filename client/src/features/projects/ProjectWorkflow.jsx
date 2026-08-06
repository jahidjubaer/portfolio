import { ArrowRight } from "lucide-react";

/**
 * Semantic HTML/CSS workflow diagram — an ordered list of lifecycle
 * steps. Stacks to a single column on mobile and flows horizontally on
 * larger viewports.
 * @param {{ steps: import("../../data/projects").WorkflowStep[] }} props
 */
export function ProjectWorkflow({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
      {steps.map((step, index) => (
        <li
          key={step.label}
          className="flex items-center gap-2 sm:items-stretch"
        >
          <div className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-4 sm:min-w-[11rem]">
            <p className="mono-meta text-(--color-accent-primary)">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="body-sm mt-1 font-medium text-(--color-text-primary)">
              {step.label}
            </p>
            <p className="body-sm mt-1 text-(--color-text-secondary)">
              {step.description}
            </p>
          </div>
          {index < steps.length - 1 ? (
            <ArrowRight
              aria-hidden="true"
              className="hidden shrink-0 text-(--color-text-muted) sm:block"
              size={18}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
