import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { STATUS_META, CASE_STUDY_META } from "./project-status-meta";

/**
 * Project status label. The tone dot is always paired with text — status
 * meaning is never color-only (CLAUDE.md accessibility rules).
 * @param {{ project: import("../../data/projects").Project, className?: string }} props
 */
export function ProjectStatus({ project, className = "" }) {
  const statusMeta = STATUS_META[project.status];
  const caseStudyMeta = CASE_STUDY_META[project.caseStudyStatus];

  return (
    <div className={className}>
      <StatusIndicator tone={statusMeta.tone}>
        {statusMeta.label}
      </StatusIndicator>
      {caseStudyMeta ? (
        <StatusIndicator tone={caseStudyMeta.tone} className="mt-1">
          {caseStudyMeta.label}
        </StatusIndicator>
      ) : null}
    </div>
  );
}
