import { ArrowUpRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { Tag } from "../components/ui/Tag";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Reveal } from "../features/motion/Reveal";
import { findProjectBySlug } from "../data/projects";

export function ProjectDetailsPage() {
  const { slug } = useParams();
  const project = findProjectBySlug(slug);

  usePageMeta(
    project
      ? {
          title: `${project.title} — Jahid Hasan`,
          description: `${project.summary} Case study for ${project.title} by Jahid Hasan.`,
        }
      : {
          title: "Project not found — Jahid Hasan",
          description:
            "This project could not be found. Return to the work index to see available case studies.",
        },
  );

  if (!project) {
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

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <SectionLabel>Case study</SectionLabel>
        <h1 className="heading-xl mt-3 text-(--color-text-primary)">
          {project.title}
        </h1>
        <p className="body-lg mt-4 text-(--color-text-secondary)">
          {project.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium text-(--color-accent-primary)">
          {project.statusLabel}
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-(--color-accent-secondary) hover:underline"
            >
              Live site <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          ) : null}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-(--color-accent-secondary) hover:underline"
            >
              Repository <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          ) : null}
        </div>

        <div className="mt-10 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6">
          <p className="body-sm text-(--color-text-secondary)">
            The full case study for {project.title} — role, architecture,
            decisions, challenges, and outcomes — is still in preparation.
          </p>
        </div>

        <div className="mt-8">
          <ButtonLink to="/work" variant="secondary">
            Back to Work
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
