import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";
import { leadershipRoles } from "../data/leadership";

export function AboutPage() {
  usePageMeta({
    title: "About — Jahid Hasan",
    description:
      "Biography, principles, capabilities, education, and leadership experience of Jahid Hasan, a frontend developer and junior software engineer.",
  });

  return (
    <Container className="py-20">
      <SectionLabel>About</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold text-(--color-text) sm:text-4xl">
        About Jahid
      </h1>
      <p className="mt-6 max-w-prose text-(--color-text-muted)">
        {profile.heroSupport}
      </p>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Education
        </h2>
        <p className="mt-3 text-(--color-text)">{profile.education.degree}</p>
        <p className="text-(--color-text-muted)">
          {profile.education.university} &middot; {profile.education.graduation}
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Capabilities
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {capabilityGroups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold text-(--color-text)">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-(--color-text-muted)">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Problem solving
        </h2>
        <p className="mt-3 text-(--color-text-muted)">
          {profile.problemSolving.total}, primarily in{" "}
          {profile.problemSolving.primaryLanguage}, across{" "}
          {profile.problemSolving.platforms}.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Leadership
        </h2>
        <ul className="mt-6 space-y-6">
          {leadershipRoles.map((role) => (
            <li key={`${role.organization}-${role.role}-${role.dates}`}>
              <p className="text-(--color-text)">
                <span className="font-semibold">{role.role}</span> &mdash;{" "}
                {role.organization}{" "}
                <span className="text-(--color-text-muted)">
                  ({role.dates})
                </span>
              </p>
              <p className="mt-1 text-sm text-(--color-text-muted)">
                {role.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Current direction
        </h2>
        <p className="mt-3 max-w-prose text-(--color-text-muted)">
          {profile.supportingDirection}
        </p>
        <div className="mt-6">
          <ButtonLink to="/contact" variant="secondary">
            Get in touch
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
