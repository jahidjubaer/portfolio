import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { projects } from "../data/projects";

export function WorkPage() {
  usePageMeta({
    title: "Selected Work — Jahid Hasan",
    description:
      "Case studies and web projects by Jahid Hasan, covering React interfaces, authentication, multi-role workflows, full-stack systems, and responsive product development.",
  });

  return (
    <Container className="py-20">
      <SectionLabel>Selected Work</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold text-(--color-text) sm:text-4xl">
        Projects I've built
      </h1>
      <p className="mt-4 max-w-prose text-(--color-text-muted)">
        A working set of React and full-stack projects. Full case studies — with
        challenges, outcomes, and screenshots — are still in preparation; what's
        shown here is verified today.
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li
            key={project.slug}
            className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6"
          >
            <h2 className="text-lg font-semibold text-(--color-text)">
              {project.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-(--color-text-muted)">
              {project.summary}
            </p>
            <p className="mt-4 font-mono text-xs text-(--color-text-muted)">
              {project.stack.join(" · ")}
            </p>
            <p className="mt-3 text-xs font-medium text-(--color-accent)">
              {project.statusLabel}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-(--color-accent-secondary) hover:underline"
                >
                  Live site
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-(--color-accent-secondary) hover:underline"
                >
                  Repository
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
