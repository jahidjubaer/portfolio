import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { Surface } from "../components/ui/Surface";
import { Tag } from "../components/ui/Tag";
import { Divider } from "../components/ui/Divider";
import { Reveal } from "../features/motion/Reveal";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";
import { leadershipRoles } from "../data/leadership";
import { ProjectStack } from "../features/projects/ProjectStack";
import { getFeaturedProjects } from "../features/projects/project-selectors";
import { Download, FileText, Code2, ExternalLink } from "lucide-react";

export function ResumePage() {
  usePageMeta({
    title: "Résumé — Jahid Hasan",
    description: profile.resume.available
      ? "Résumé summary and downloadable PDF for Jahid Hasan, a CSE graduate and frontend developer / junior software engineer."
      : "Résumé summary of Jahid Hasan, a CSE graduate and frontend developer / junior software engineer.",
  });

  const featuredProjects = getFeaturedProjects();

  return (
    <Container as="div" className="section-spacing max-w-4xl">
      <Reveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionLabel>Résumé</SectionLabel>
            <h1 className="heading-xl mt-2 text-(--color-text-primary)">
              {profile.name}
            </h1>
            <p className="body-md mt-1 font-medium text-(--color-accent-primary)">
              {profile.title}
            </p>
            <p className="body-sm mt-1 text-(--color-text-muted)">
              {profile.location} &middot; {profile.email}
            </p>
          </div>

          {profile.resume.available && (
            <div className="shrink-0 flex flex-wrap items-center gap-3">
              <ButtonLink
                href={profile.resume.url}
                download={profile.resume.filename}
                variant="primary"
                size="lg"
                leadingIcon={<Download size={18} />}
              >
                Download PDF
              </ButtonLink>
              <a
                href={profile.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-(--color-text-secondary) hover:text-(--color-accent-primary)"
              >
                Preview
                <ExternalLink size={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          )}
        </div>

        {/* Status Callout Card */}
        <Surface variant="raised" className="mt-8 p-6 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-1 bg-(--color-accent-primary)"
            aria-hidden="true"
          />
          {/* The résumé's last-updated date is TODO_CONTENT (see
              CONTENT_CHECKLIST.md section 5) and is not shown until confirmed. */}
          <StatusIndicator tone="positive">
            {profile.availabilityStatement}
          </StatusIndicator>
          <p className="body-md mt-3 text-(--color-text-secondary)">
            {profile.heroSupport}
          </p>
        </Surface>

        <Divider className="my-12" />

        {/* Education & Problem Solving Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Education Card */}
          <Surface variant="default" className="p-6">
            <div className="flex items-center gap-2.5 text-(--color-accent-primary)">
              <FileText size={18} />
              <h2 className="label text-(--color-text-muted) uppercase">
                Education
              </h2>
            </div>
            <h3 className="heading-md mt-3 text-(--color-text-primary)">
              {profile.education.degree}
            </h3>
            <p className="body-sm mt-1 font-medium text-(--color-text-secondary)">
              {profile.education.university}
            </p>
            <p className="mono-meta mt-2 text-(--color-text-muted)">
              Graduation: {profile.education.graduation}
            </p>
          </Surface>

          {/* Problem Solving Card */}
          <Surface variant="default" className="p-6">
            <div className="flex items-center gap-2.5 text-(--color-accent-primary)">
              <Code2 size={18} />
              <h2 className="label text-(--color-text-muted) uppercase">
                Problem Solving
              </h2>
            </div>
            <h3 className="heading-md mt-3 text-(--color-text-primary)">
              {profile.problemSolving.total}
            </h3>
            <p className="body-sm mt-1 text-(--color-text-secondary)">
              Primary Language:{" "}
              <span className="font-mono text-(--color-text-primary)">
                {profile.problemSolving.primaryLanguage}
              </span>
            </p>
            <p className="mono-meta mt-2 text-(--color-text-muted)">
              Platforms: {profile.problemSolving.platforms}
            </p>
          </Surface>
        </div>

        <Divider className="my-12" />

        {/* Key Skills */}
        <section>
          <h2 className="label text-(--color-text-muted) uppercase tracking-wider">
            Technical Capabilities
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {capabilityGroups.map((group) => (
              <Surface key={group.id} variant="raised" className="p-5">
                <h3 className="text-sm font-semibold text-(--color-accent-primary)">
                  {group.title}
                </h3>
                <p className="mt-1 text-xs text-(--color-text-muted)">
                  {group.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              </Surface>
            ))}
          </div>
        </section>

        <Divider className="my-12" />

        {/* Featured Projects */}
        <section>
          <h2 className="label text-(--color-text-muted) uppercase tracking-wider">
            Featured Engineering Projects
          </h2>
          <div className="mt-6 space-y-4">
            {featuredProjects.map((project) => (
              <Surface key={project.slug} variant="default" className="p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="heading-md text-(--color-text-primary)">
                    {project.title}
                  </h3>
                  <span className="mono-meta text-(--color-accent-primary)">
                    {project.context}
                  </span>
                </div>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {project.summary}
                </p>
                <ProjectStack stack={project.stack} className="mt-4" />
              </Surface>
            ))}
          </div>
        </section>

        <Divider className="my-12" />

        {/* Leadership & Involvement */}
        <section>
          <h2 className="label text-(--color-text-muted) uppercase tracking-wider">
            Leadership & Community
          </h2>
          <div className="mt-6 space-y-4">
            {leadershipRoles.map((role) => (
              <Surface
                key={`${role.organization}-${role.role}-${role.dates}`}
                variant="raised"
                className="p-6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-base font-semibold text-(--color-text-primary)">
                    {role.role}{" "}
                    <span className="font-normal text-(--color-text-secondary)">
                      at {role.organization}
                    </span>
                  </h3>
                  <span className="mono-meta text-(--color-text-muted)">
                    {role.dates}
                  </span>
                </div>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {role.description}
                </p>
              </Surface>
            ))}
          </div>
        </section>
      </Reveal>
    </Container>
  );
}
