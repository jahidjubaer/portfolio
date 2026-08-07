import { useParams } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Divider } from "../components/ui/Divider";
import { Reveal } from "../features/motion/Reveal";
import { ProjectHero } from "../features/projects/ProjectHero";
import { ProjectSection } from "../features/projects/ProjectSection";
import { ProjectSectionNav } from "../features/projects/ProjectSectionNav";
import { ProjectWorkflow } from "../features/projects/ProjectWorkflow";
import { ProjectArchitecture } from "../features/projects/ProjectArchitecture";
import { ProjectMediaGallery } from "../features/projects/ProjectMediaGallery";
import { RelatedProjects } from "../features/projects/RelatedProjects";
import { CaseStudyUnavailable } from "../features/projects/CaseStudyUnavailable";
import {
  getProjectBySlug,
  getRelatedProjects,
} from "../features/projects/project-selectors";
import { getProjectMedia } from "../lib/project-assets";

function ProjectNotFound({ slug }) {
  return (
    <Container as="div" className="section-spacing text-center">
      <Reveal>
        <h1 className="heading-xl text-(--color-text-primary)">
          Project not found
        </h1>
        <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
          No project matches &quot;{slug}&quot;. See the work index for
          available projects.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/work" variant="primary">
            View Work
          </ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Return home
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}

function RelatedProjectsSection({ relatedProjects }) {
  if (relatedProjects.length === 0) return null;

  return (
    <div className="mt-16">
      <Divider className="mb-12" />
      <h2 className="heading-md text-(--color-text-primary)">
        Related projects
      </h2>
      <div className="mt-6">
        <RelatedProjects projects={relatedProjects} />
      </div>
    </div>
  );
}

function ProjectInPreparation({ project, relatedProjects }) {
  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <ProjectHero project={project} />

        {project.roleContext ? (
          <p className="body-md mt-6 max-w-prose text-(--color-text-secondary)">
            {project.roleContext}
          </p>
        ) : null}

        {project.capabilities?.length ? (
          <div className="mt-10">
            <h2 className="label text-(--color-text-muted)">
              Known capabilities
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {project.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="body-sm flex items-start gap-2 text-(--color-text-secondary)"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent-primary)"
                  />
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10">
          <CaseStudyUnavailable
            message={`The full case study for ${project.title} — role, architecture, decisions, challenges, and outcomes — is still in preparation.`}
          />
        </div>
      </Reveal>
      <RelatedProjectsSection relatedProjects={relatedProjects} />
      <div className="mt-10">
        <ButtonLink to="/work" variant="secondary">
          Back to Work
        </ButtonLink>
      </div>
    </Container>
  );
}

function CompleteCaseStudy({ project, relatedProjects }) {
  const caseStudy = project.caseStudy;
  const hasReflectionContent =
    caseStudy.challenge || caseStudy.outcome || caseStudy.reflection;

  const { gallery: galleryImages } = getProjectMedia(project.slug);
  const hasGallery = galleryImages.length > 0;
  const captionsByFile = Object.fromEntries(
    (caseStudy.gallery ?? []).map((entry) => [entry.file, entry.caption]),
  );
  const visibleSections = caseStudy.sections.filter(
    (section) => hasGallery || section.id !== "gallery",
  );

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <ProjectHero project={project} />
      </Reveal>

      <ProjectSectionNav sections={visibleSections} className="mt-10" />

      <div className="mt-10 space-y-14">
        <ProjectSection id="overview" heading="Overview">
          <p className="body-md text-(--color-text-secondary)">
            {caseStudy.overview}
          </p>
          {caseStudy.responsibility ? (
            <p className="body-md mt-3 text-(--color-text-secondary)">
              {caseStudy.responsibility}
            </p>
          ) : null}
        </ProjectSection>

        <ProjectSection id="roles" heading="Roles">
          {caseStudy.roles?.length ? (
            <ul className="grid gap-4 sm:grid-cols-3">
              {caseStudy.roles.map((role) => (
                <li
                  key={role.name}
                  className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-4"
                >
                  <p className="font-medium text-(--color-text-primary)">
                    {role.name}
                  </p>
                  <p className="body-sm mt-1 text-(--color-text-secondary)">
                    {role.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </ProjectSection>

        <ProjectSection id="workflow" heading="Workflow">
          {typeof caseStudy.workflow === "string" && caseStudy.workflow ? (
            <p className="body-md text-(--color-text-secondary)">
              {caseStudy.workflow}
            </p>
          ) : null}
          {Array.isArray(caseStudy.workflow) && caseStudy.workflow.length ? (
            <ProjectWorkflow steps={caseStudy.workflow} />
          ) : null}
        </ProjectSection>

        <ProjectSection id="capabilities" heading="Capabilities">
          {caseStudy.capabilities?.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {caseStudy.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="body-sm flex items-start gap-2 text-(--color-text-secondary)"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent-primary)"
                  />
                  {capability}
                </li>
              ))}
            </ul>
          ) : null}
        </ProjectSection>

        {hasGallery ? (
          <ProjectSection id="gallery" heading="Gallery">
            <ProjectMediaGallery
              title={project.title}
              images={galleryImages}
              captionsByFile={captionsByFile}
            />
          </ProjectSection>
        ) : null}

        <ProjectSection id="architecture" heading="Architecture">
          {caseStudy.architecture?.length ? (
            <ProjectArchitecture layers={caseStudy.architecture} />
          ) : null}
        </ProjectSection>

        <ProjectSection id="decisions" heading="Implementation approach">
          {caseStudy.decisions?.length ? (
            <ul className="space-y-3">
              {caseStudy.decisions.map((decision) => (
                <li
                  key={decision}
                  className="body-sm text-(--color-text-secondary)"
                >
                  {decision}
                </li>
              ))}
            </ul>
          ) : null}
        </ProjectSection>

        <ProjectSection
          id="reflection"
          heading="Challenge, outcome and reflection"
        >
          {hasReflectionContent ? (
            <div className="space-y-4">
              {caseStudy.challenge ? (
                <p className="body-sm text-(--color-text-secondary)">
                  <strong className="text-(--color-text-primary)">
                    Challenge:{" "}
                  </strong>
                  {caseStudy.challenge}
                </p>
              ) : null}
              {caseStudy.outcome ? (
                <p className="body-sm text-(--color-text-secondary)">
                  <strong className="text-(--color-text-primary)">
                    Outcome:{" "}
                  </strong>
                  {caseStudy.outcome}
                </p>
              ) : null}
              {caseStudy.reflection ? (
                <p className="body-sm text-(--color-text-secondary)">
                  <strong className="text-(--color-text-primary)">
                    Reflection:{" "}
                  </strong>
                  {caseStudy.reflection}
                </p>
              ) : null}
            </div>
          ) : (
            <CaseStudyUnavailable />
          )}
        </ProjectSection>
      </div>

      <RelatedProjectsSection relatedProjects={relatedProjects} />

      <div className="mt-10">
        <ButtonLink to="/work" variant="secondary">
          Back to Work
        </ButtonLink>
      </div>
    </Container>
  );
}

export function ProjectDetailsPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const relatedProjects = project ? getRelatedProjects(slug) : [];

  usePageMeta(
    project
      ? {
          title: project.seo.title,
          description: project.seo.description,
        }
      : {
          title: "Project not found — Jahid Hasan",
          description:
            "This project could not be found. Return to the work index to see available case studies.",
          robots: "noindex, follow",
        },
  );

  if (!project) {
    return <ProjectNotFound slug={slug} />;
  }

  if (project.caseStudyStatus === "complete" && project.caseStudy) {
    return (
      <CompleteCaseStudy project={project} relatedProjects={relatedProjects} />
    );
  }

  return (
    <ProjectInPreparation project={project} relatedProjects={relatedProjects} />
  );
}
