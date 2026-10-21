import { usePageMeta } from "../hooks/usePageMeta";
import { resumeMeta } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { Surface } from "../components/ui/Surface";
import { Tag } from "../components/ui/Tag";
import { ProblemSolvingStats } from "../features/coding/ProblemSolvingStats";
import { Divider } from "../components/ui/Divider";
import { Reveal } from "../features/motion/Reveal";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";
import { leadershipRoles } from "../data/leadership";
import {
  languages,
  sportsHighlights,
  volunteeringHighlights,
} from "../data/beyond";
import { degreeLine, educationEntries } from "../data/education";
import { formatRange } from "../lib/dates";
import { ProjectStack } from "../features/projects/ProjectStack";
import { getFeaturedProjects } from "../features/projects/project-selectors";
import { Download, GraduationCap, Code2, ExternalLink } from "lucide-react";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";

export function ResumePage() {
  usePageMeta(resumeMeta(profile.resume.available));

  const featuredProjects = getFeaturedProjects();

  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Resume</PageHeaderTitle>
      </PageHeader>
      <Container as="div" className="section-spacing max-w-4xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <SectionLabel>Resume</SectionLabel>
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
          <Surface
            variant="raised"
            className="mt-8 p-6 relative overflow-hidden"
          >
            <div
              className="absolute inset-y-0 left-0 w-1 bg-(--color-accent-fill)"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusIndicator tone="positive">
                {profile.availabilityStatement}
              </StatusIndicator>
              {profile.resume.available && profile.resume.updatedLabel ? (
                <span className="font-mono text-xs text-(--color-text-muted)">
                  {profile.resume.updatedLabel}
                </span>
              ) : null}
            </div>
            <p className="body-md mt-3 text-(--color-text-secondary)">
              {profile.heroSupport}
            </p>
          </Surface>

          <Divider className="my-12" />

          {/* Education timeline, then Problem Solving, each full width so
              neither leaves an empty column beside the other. */}
          <Surface variant="default" className="p-6">
            <div className="flex items-center gap-2.5 text-(--color-accent-primary)">
              <GraduationCap size={18} />
              <h2 className="label text-(--color-text-muted) uppercase">
                Education
              </h2>
            </div>
            <ol className="mt-5 grid gap-5 border-l border-(--color-border) pl-5">
              {educationEntries.map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[1.6875rem] size-2.5 rounded-full border-2 border-(--color-accent-primary) bg-(--color-canvas)"
                  />
                  <h3 className="heading-md text-(--color-text-primary)">
                    {degreeLine(entry)}
                  </h3>
                  <p className="body-sm mt-1 font-medium text-(--color-text-secondary)">
                    {[entry.organization.name, entry.organization.location]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {entry.end || entry.start ? (
                    <p className="mono-meta mt-1.5 text-(--color-text-muted)">
                      {formatRange(entry)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </Surface>

          <Surface variant="default" className="mt-6 p-6">
            <div className="flex items-center gap-2.5 text-(--color-accent-primary)">
              <Code2 size={18} />
              <h2 className="label text-(--color-text-muted) uppercase">
                Problem Solving
              </h2>
            </div>
            <ProblemSolvingStats className="mt-4" />
          </Surface>

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
              {sportsHighlights.map((item) => (
                <Surface key={item.title} variant="raised" className="p-6">
                  <h3 className="text-base font-semibold text-(--color-text-primary)">
                    {item.title}
                  </h3>
                  <p className="body-sm mt-2 text-(--color-text-secondary)">
                    {item.description}
                  </p>
                </Surface>
              ))}
              {volunteeringHighlights.map((item) => (
                <Surface
                  key={item.organization}
                  variant="raised"
                  className="p-6"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-semibold text-(--color-text-primary)">
                      Volunteer{" "}
                      <span className="font-normal text-(--color-text-secondary)">
                        at {item.organization}
                      </span>
                    </h3>
                    <span className="mono-meta text-(--color-text-muted)">
                      {item.period}
                    </span>
                  </div>
                  <p className="body-sm mt-2 text-(--color-text-secondary)">
                    {item.description}
                  </p>
                </Surface>
              ))}
            </div>
          </section>

          {languages.length ? (
            <>
              <Divider className="my-12" />
              <section>
                <h2 className="label text-(--color-text-muted) uppercase tracking-wider">
                  Languages
                </h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  {languages.map((language) => (
                    <div key={language.name}>
                      <dt className="font-semibold text-(--color-text-primary)">
                        {language.name}
                      </dt>
                      <dd className="body-sm text-(--color-text-secondary)">
                        {language.level}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </>
          ) : null}
        </Reveal>
      </Container>
    </>
  );
}
