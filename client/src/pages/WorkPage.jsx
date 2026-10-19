import { usePageMeta } from "../hooks/usePageMeta";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { StaggerGroup, StaggerItem } from "../features/motion/StaggerGroup";
import { ProjectCard } from "../features/projects/ProjectCard";
import { getAllProjects } from "../features/projects/project-selectors";

export function WorkPage() {
  const allProjects = getAllProjects();
  const current = allProjects.filter(
    (project) => project.status !== "archived",
  );
  const archived = allProjects.filter(
    (project) => project.status === "archived",
  );

  usePageMeta({
    title: "Projects — Jahid Hasan",
    description:
      "Projects by Jahid Hasan: multi-role web platforms, React interfaces, and full-stack products built with React, Express, and MongoDB.",
  });

  return (
    <>
      <PageHeader>
        <PageHeaderTitle as="h1">Projects</PageHeaderTitle>
      </PageHeader>
      <p className="px-4 pt-7 text-[1.0625rem] text-(--color-text-secondary) sm:px-7">
        Products I&apos;ve designed, built, and shipped, with the code behind
        them.
      </p>
      <StaggerGroup
        as="ul"
        className="grid gap-5 px-4 py-6 sm:grid-cols-2 sm:px-7"
      >
        {current.map((project, index) => (
          <StaggerItem key={project.slug} as="li">
            <ProjectCard
              project={project}
              headingLevel="h2"
              priorityImage={index === 0}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {archived.length > 0 ? (
        <section
          aria-labelledby="archive-heading"
          className="border-t border-(--color-border) px-4 py-8 sm:px-7"
        >
          <h2
            id="archive-heading"
            className="text-[1.3125rem] font-semibold text-(--color-text-primary)"
          >
            Archive
          </h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2">
            {archived.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
