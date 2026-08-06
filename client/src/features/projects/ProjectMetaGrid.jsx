import { STATUS_META, CASE_STUDY_META } from "./project-status-meta";

/**
 * Key/value meta pairs for a project (type, status, case-study state) as
 * an accessible description list.
 * @param {{ project: import("../../data/projects").Project, className?: string }} props
 */
export function ProjectMetaGrid({ project, className = "" }) {
  const caseStudyMeta = CASE_STUDY_META[project.caseStudyStatus];
  const items = [
    { label: "Type", value: project.projectType },
    { label: "Status", value: STATUS_META[project.status].label },
  ];
  if (caseStudyMeta) {
    items.push({ label: "Case study", value: caseStudyMeta.label });
  }

  return (
    <dl
      className={`grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 ${className}`}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="eyebrow text-(--color-text-muted)">{item.label}</dt>
          <dd className="body-sm mt-1 text-(--color-text-primary)">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
