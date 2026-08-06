import { ArrowUpRight } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Tag } from "../components/ui/Tag";
import { StaggerGroup, StaggerItem } from "../features/motion/StaggerGroup";
import { projects } from "../data/projects";

export function WorkPage() {
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
        description={`${projects.length} project${projects.length === 1 ? "" : "s"} shown below. Full case studies — with challenges, outcomes, and screenshots — are still in preparation; what's shown here is verified today.`}
      />

      <StaggerGroup
        as="ul"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <StaggerItem
            key={project.slug}
            as="li"
            className="flex flex-col rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6"
          >
            <h2 className="heading-md text-(--color-text-primary)">
              {project.title}
            </h2>
            <p className="body-sm mt-2 flex-1 text-(--color-text-secondary)">
              {project.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
            <p className="mt-4 text-xs font-medium text-(--color-accent-primary)">
              {project.statusLabel}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-(--color-accent-secondary) hover:underline"
                >
                  Live site <ArrowUpRight aria-hidden="true" size={12} />
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-(--color-accent-secondary) hover:underline"
                >
                  Repository <ArrowUpRight aria-hidden="true" size={12} />
                </a>
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Container>
  );
}
