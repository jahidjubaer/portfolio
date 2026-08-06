import { useParams } from "react-router-dom";
import { RoutePlaceholder } from "../components/ui/RoutePlaceholder";
import { findProjectBySlug } from "../data/projects";

export function ProjectDetailsPage() {
  const { slug } = useParams();
  const project = findProjectBySlug(slug);

  if (!project) {
    return (
      <RoutePlaceholder
        title="Project not found — Jahid Hasan"
        description="This project could not be found. Return to the work index to see available case studies."
        heading="Project not found"
        statement={`No project matches "${slug}". See the work index for available projects.`}
      />
    );
  }

  return (
    <RoutePlaceholder
      title={`${project.title} — Jahid Hasan`}
      description={`Case study for ${project.title} by Jahid Hasan.`}
      heading={project.title}
      statement={`The full case study for ${project.title} — including role, challenges, and outcomes — is still in preparation. See the work index for what's verified today.`}
    />
  );
}
