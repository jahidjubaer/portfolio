import { Surface } from "../../components/ui/Surface";

/**
 * Restrained, honest note shown wherever case-study evidence does not
 * exist yet — never replaced with invented storytelling.
 * @param {{ message?: string, className?: string }} props
 */
export function CaseStudyUnavailable({
  message = "Detailed implementation notes for this section are still being prepared.",
  className = "",
}) {
  return (
    <Surface className={`p-6 ${className}`}>
      <p className="body-sm text-(--color-text-secondary)">{message}</p>
    </Surface>
  );
}
