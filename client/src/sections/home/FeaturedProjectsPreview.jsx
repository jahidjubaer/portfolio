import { SectionHeader } from "../../components/ui/SectionHeader";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { Reveal } from "../../features/motion/Reveal";
import { StaggerGroup, StaggerItem } from "../../features/motion/StaggerGroup";
import { FeaturedProjectDossier } from "../../features/projects/FeaturedProjectDossier";
import { ProjectCard } from "../../features/projects/ProjectCard";
import { getFeaturedProjects } from "../../features/projects/project-selectors";

export function FeaturedProjectsPreview() {
  const [featured, ...rest] = getFeaturedProjects();

  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container>
        <SectionHeader
          label="Selected Work"
          heading="Recent projects"
          description="A working set of React and full-stack projects. Sarabo is a complete case study; the rest are in preparation."
        />

        <div className="mt-12 space-y-6">
          {featured ? (
            <Reveal>
              <FeaturedProjectDossier project={featured} index={1} />
            </Reveal>
          ) : null}

          {rest.length > 0 ? (
            <StaggerGroup as="div" className="grid gap-6 sm:grid-cols-2">
              {rest.map((project) => (
                <StaggerItem key={project.slug}>
                  <ProjectCard project={project} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : null}
        </div>

        <div className="mt-10">
          <ButtonLink to="/work" variant="secondary">
            View all work
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
