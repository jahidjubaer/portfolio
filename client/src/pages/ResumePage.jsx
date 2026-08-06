import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { Reveal } from "../features/motion/Reveal";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";
import { leadershipRoles } from "../data/leadership";
import { ProjectStack } from "../features/projects/ProjectStack";
import { getFeaturedProjects } from "../features/projects/project-selectors";

export function ResumePage() {
  usePageMeta({
    title: "Résumé — Jahid Hasan",
    description:
      "Résumé summary of Jahid Hasan, a CSE graduate and frontend developer / junior software engineer. The downloadable PDF is being prepared.",
  });

  const featuredProjects = getFeaturedProjects();

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <SectionLabel>Résumé</SectionLabel>
        <h1 className="heading-xl mt-3 text-(--color-text-primary)">Résumé</h1>

        <section className="mt-6">
          <p className="body-lg font-medium text-(--color-text-primary)">
            {profile.name}
          </p>
          <p className="body-md text-(--color-text-secondary)">
            {profile.title}
          </p>
          <p className="body-sm mt-1 text-(--color-text-muted)">
            {profile.location}
          </p>
          <StatusIndicator tone="positive" className="mt-3">
            {profile.availabilityStatement}
          </StatusIndicator>
          <p className="body-md mt-4 max-w-prose text-(--color-text-secondary)">
            {profile.heroSupport}
          </p>
        </section>

        {profile.resume.available ? (
          <div className="mt-8">
            <ButtonLink
              href={profile.resume.url}
              download={profile.resume.filename}
              variant="primary"
            >
              Download résumé PDF
            </ButtonLink>
            <p className="body-sm mt-3 max-w-prose text-(--color-text-muted)">
              A concise portfolio résumé overview is shown below. The
              downloadable PDF contains the current formatted résumé.
            </p>
          </div>
        ) : (
          <p className="body-md mt-6 max-w-prose text-(--color-text-secondary)">
            The downloadable résumé PDF is being prepared. In the meantime,
            here&apos;s a summary of my education and current capabilities.
          </p>
        )}

        <section className="mt-14">
          <h2 className="label text-(--color-text-muted)">Education</h2>
          <p className="body-md mt-3 text-(--color-text-primary)">
            {profile.education.degree}
          </p>
          <p className="body-sm text-(--color-text-secondary)">
            {profile.education.university} &middot;{" "}
            {profile.education.graduation}
          </p>
        </section>

        <section className="mt-14">
          <h2 className="label text-(--color-text-muted)">Key skills</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {capabilityGroups.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-(--color-text-primary)">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-(--color-text-secondary)">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="label text-(--color-text-muted)">Selected projects</h2>
          <ul className="mt-6 space-y-6">
            {featuredProjects.map((project) => (
              <li key={project.slug}>
                <p className="font-semibold text-(--color-text-primary)">
                  {project.title}
                </p>
                <p className="body-sm mt-1 text-(--color-text-secondary)">
                  {project.summary}
                </p>
                <ProjectStack stack={project.stack} className="mt-2" />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="label text-(--color-text-muted)">Leadership</h2>
          <ul className="mt-6 space-y-6">
            {leadershipRoles.map((role) => (
              <li key={`${role.organization}-${role.role}-${role.dates}`}>
                <p className="text-(--color-text-primary)">
                  <span className="font-semibold">{role.role}</span> &mdash;{" "}
                  {role.organization}{" "}
                  <span className="mono-meta text-(--color-text-muted)">
                    ({role.dates})
                  </span>
                </p>
                <p className="body-sm mt-1 text-(--color-text-secondary)">
                  {role.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="label text-(--color-text-muted)">Problem solving</h2>
          <p className="body-sm mt-3 text-(--color-text-secondary)">
            {profile.problemSolving.total}, primarily in{" "}
            {profile.problemSolving.primaryLanguage}, across{" "}
            {profile.problemSolving.platforms}.
          </p>
        </section>
      </Reveal>
    </Container>
  );
}
