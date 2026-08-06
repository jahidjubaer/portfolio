import { SectionLabel } from "../../components/ui/SectionLabel";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { projects } from "../../data/projects";

export function FeaturedProjectsPreview() {
  return (
    <section className="border-b border-(--color-border) py-20">
      <Container>
        <SectionLabel>Selected Work</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold text-(--color-text) sm:text-3xl">
          Recent projects
        </h2>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6"
            >
              <h3 className="text-lg font-semibold text-(--color-text)">
                {project.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-(--color-text-muted)">
                {project.summary}
              </p>
              <p className="mt-4 font-mono text-xs text-(--color-text-muted)">
                {project.stack.join(" · ")}
              </p>
              <p className="mt-3 text-xs font-medium text-(--color-accent)">
                {project.statusLabel}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <ButtonLink to="/work" variant="secondary">
            View all work
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
