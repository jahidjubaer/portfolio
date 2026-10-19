import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { usePageMeta } from "../hooks/usePageMeta";
import { projectMeta } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Divider } from "../components/ui/Divider";
import { Markdown } from "../components/ui/Markdown";
import { Reveal } from "../features/motion/Reveal";
import { ProjectHero } from "../features/projects/ProjectHero";
import { ProjectSection } from "../features/projects/ProjectSection";
import { ProjectSectionNav } from "../features/projects/ProjectSectionNav";
import { ProjectMediaGallery } from "../features/projects/ProjectMediaGallery";
import { RelatedProjects } from "../features/projects/RelatedProjects";
import { CaseStudyPager } from "../features/projects/CaseStudyPager";
import { CaseStudyUnavailable } from "../features/projects/CaseStudyUnavailable";
import { ReadingProgressBar } from "../features/projects/ReadingProgressBar";
import {
  getProjectBySlug,
  getRelatedProjects,
} from "../features/projects/project-selectors";
import { getProjectMedia } from "../lib/project-assets";

/**
 * Header for project routes: a back link to the index plus the project
 * name. The page body owns the H1, so the name here is plain text.
 * @param {{ title?: string }} props
 */
function ProjectPageHeader({ title }) {
  return (
    <PageHeader
      actions={
        <ButtonLink
          to="/contact"
          size="sm"
          leadingIcon={<Mail size={15} />}
          className="max-sm:hidden"
        >
          Contact
        </ButtonLink>
      }
    >
      <Link
        to="/work"
        aria-label="Back to projects"
        className="grid size-11 shrink-0 place-items-center rounded-full text-(--color-text-secondary) transition-colors hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)"
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <p className="min-w-0 truncate text-[1.0625rem] font-semibold text-(--color-text-primary)">
        <span className="text-(--color-text-muted)">Projects</span>
        {title ? <span aria-hidden="true"> / </span> : null}
        {title}
      </p>
    </PageHeader>
  );
}

function ProjectNotFound({ slug }) {
  return (
    <>
      <ProjectPageHeader />
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
    </>
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
  // Manifest-tracked screenshots render even before the written case
  // study exists — real product imagery is verified evidence, while the
  // narrative sections stay honestly "in preparation" until confirmed.
  const { gallery: galleryImages } = getProjectMedia(project.slug);

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
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent-fill)"
                  />
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {galleryImages.length > 0 ? (
          <div className="mt-10">
            <h2 className="label text-(--color-text-muted)">Screenshots</h2>
            <div className="mt-4">
              <ProjectMediaGallery
                title={project.title}
                images={galleryImages}
                captionsByFile={{}}
              />
            </div>
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
  const { gallery: galleryImages } = getProjectMedia(project.slug);
  const captionsByFile = Object.fromEntries(
    (caseStudy.gallery ?? []).map((entry) => [entry.file, entry.caption]),
  );
  // A gallery section without screenshots would be an empty heading.
  const visibleSections = caseStudy.sections.filter(
    (section) => section.type !== "gallery" || galleryImages.length > 0,
  );

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <ProjectHero project={project} />
      </Reveal>

      <ProjectSectionNav sections={visibleSections} className="mt-10" />

      <div className="mt-10 space-y-14">
        {visibleSections.map((section) => (
          <ProjectSection
            key={section.id}
            id={section.id}
            heading={section.heading}
          >
            {section.type === "gallery" ? (
              <ProjectMediaGallery
                title={project.title}
                images={galleryImages}
                captionsByFile={captionsByFile}
              />
            ) : (
              <Markdown>{section.body}</Markdown>
            )}
          </ProjectSection>
        ))}
      </div>

      <RelatedProjectsSection relatedProjects={relatedProjects} />

      <CaseStudyPager slug={project.slug} />

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
      ? projectMeta(project)
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

  const isCompleteCaseStudy =
    project.caseStudyStatus === "complete" && Boolean(project.caseStudy);

  return (
    <>
      <ProjectPageHeader title={project.title} />
      {/* Route-specific reading aid — deliberately not in AppLayout. */}
      {isCompleteCaseStudy ? <ReadingProgressBar /> : null}
      {isCompleteCaseStudy ? (
        <CompleteCaseStudy
          project={project}
          relatedProjects={relatedProjects}
        />
      ) : (
        <ProjectInPreparation
          project={project}
          relatedProjects={relatedProjects}
        />
      )}
    </>
  );
}
