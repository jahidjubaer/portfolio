import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SectionLabel } from "../components/ui/SectionLabel";
import { StaggerGroup, StaggerItem } from "../features/motion/StaggerGroup";
import { FeaturedProjectDossier } from "../features/projects/FeaturedProjectDossier";
import { ProjectCard } from "../features/projects/ProjectCard";
import { getAllProjects } from "../features/projects/project-selectors";

export function WorkPage() {
  const allProjects = getAllProjects();
  const completeCaseStudies = allProjects.filter(
    (project) => project.caseStudyStatus === "complete",
  );
  const inPreparation = allProjects.filter(
    (project) => project.caseStudyStatus === "in-preparation",
  );
  const archived = allProjects.filter(
    (project) => project.status === "archived",
  );

  usePageMeta({
    title: "Selected Work — Jahid Hasan",
    description:
      "Case studies and web projects by Jahid Hasan, covering React interfaces, authentication, multi-role workflows, full-stack systems, and responsive product development.",
  });

  return (
    <Container as="div" className="section-spacing">
      <SectionHeader
        as="h1"
        label="Selected Work"
        heading="Projects I've built"
        description={`${allProjects.length} project${allProjects.length === 1 ? "" : "s"} shown below. ${completeCaseStudies.length} full case ${completeCaseStudies.length === 1 ? "study is" : "studies are"} available today; the rest are shown as verified project overviews while their full case studies are prepared.`}
      />
      <p className="body-sm mt-4 max-w-prose text-(--color-text-muted)">
        I build focused, working products end-to-end and document them with
        evidence I can actually stand behind — no invented metrics, no rewritten
        history.
      </p>

      {completeCaseStudies.length > 0 ? (
        <div className="mt-12">
          <SectionLabel>
            {completeCaseStudies.length === 1
              ? "Flagship project"
              : "Flagship projects"}
          </SectionLabel>
          <div className="mt-6 space-y-6">
            {completeCaseStudies.map((project, index) => (
              <FeaturedProjectDossier
                key={project.slug}
                project={project}
                index={index + 1}
                headingLevel="h2"
                showMeta
              />
            ))}
          </div>
        </div>
      ) : null}

      {inPreparation.length > 0 ? (
        <div className="mt-16">
          <SectionLabel>Supporting projects</SectionLabel>
          <p className="body-sm mt-3 max-w-prose text-(--color-text-secondary)">
            Verified project overviews — technologies, known features, and
            current status — while their full narrative case studies are
            prepared.
          </p>
          <StaggerGroup as="ul" className="mt-6 grid gap-6 sm:grid-cols-2">
            {inPreparation.map((project) => (
              <StaggerItem key={project.slug} as="li">
                <ProjectCard project={project} headingLevel="h2" />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      ) : null}

      {archived.length > 0 ? (
        <div className="mt-16">
          <SectionLabel>Archive</SectionLabel>
          <StaggerGroup
            as="ul"
            className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {archived.map((project) => (
              <StaggerItem key={project.slug} as="li">
                <ProjectCard project={project} headingLevel="h2" />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      ) : null}
    </Container>
  );
}
