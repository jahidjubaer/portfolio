import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Tag } from "../../components/ui/Tag";
import { Container } from "../../components/ui/Container";
import { Reveal } from "../../features/motion/Reveal";
import { StaggerGroup, StaggerItem } from "../../features/motion/StaggerGroup";
import { projects } from "../../data/projects";

function ProjectLink({ project }) {
  const href = project.liveUrl ?? project.repoUrl;
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-(--color-accent-secondary) hover:underline"
    >
      {project.liveUrl ? "Live site" : "Repository"}
      <ArrowUpRight aria-hidden="true" size={14} />
    </a>
  );
}

export function FeaturedProjectsPreview() {
  const [featured, ...rest] = projects;

  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container>
        <SectionHeader
          label="Selected Work"
          heading="Recent projects"
          description="A working set of React and full-stack projects. Full case studies are still in preparation — what's shown here is verified today."
        />

        <div className="mt-12 space-y-6">
          {featured ? (
            <Reveal>
              <article className="grid gap-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-8 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-10">
                <span className="mono-meta text-(--color-accent-primary)">
                  01
                </span>
                <div>
                  <h3 className="heading-lg text-(--color-text-primary)">
                    {featured.title}
                  </h3>
                  <p className="body-md mt-3 text-(--color-text-secondary)">
                    {featured.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {featured.stack.map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-(--color-accent-primary)">
                      {featured.statusLabel}
                    </span>
                    <ProjectLink project={featured} />
                  </div>
                </div>
              </article>
            </Reveal>
          ) : null}

          {rest.length > 0 ? (
            <StaggerGroup as="div" className="grid gap-6 sm:grid-cols-2">
              {rest.map((project, index) => (
                <StaggerItem
                  key={project.slug}
                  as="article"
                  className="flex flex-col rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6"
                >
                  <span className="mono-meta text-(--color-accent-primary)">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <h3 className="heading-md mt-3 text-(--color-text-primary)">
                    {project.title}
                  </h3>
                  <p className="body-sm mt-2 flex-1 text-(--color-text-secondary)">
                    {project.summary}
                  </p>
                  <p className="mono-meta mt-4 text-(--color-text-muted)">
                    {project.stack.join(" · ")}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-(--color-accent-primary)">
                      {project.statusLabel}
                    </span>
                    <ProjectLink project={project} />
                  </div>
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
