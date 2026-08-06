import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";

export function ResumePage() {
  usePageMeta({
    title: "Résumé — Jahid Hasan",
    description:
      "Résumé summary of Jahid Hasan, a CSE graduate and frontend developer / junior software engineer. The downloadable PDF is being prepared.",
  });

  return (
    <Container className="py-20">
      <SectionLabel>Résumé</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold text-(--color-text) sm:text-4xl">
        Résumé
      </h1>

      {profile.resume.available ? (
        <div className="mt-6">
          <ButtonLink href={profile.resume.url} variant="primary">
            Download Résumé (PDF)
          </ButtonLink>
        </div>
      ) : (
        <p className="mt-6 max-w-prose text-(--color-text-muted)">
          The downloadable résumé PDF is being prepared. In the meantime, here's
          a summary of my education and current capabilities.
        </p>
      )}

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Education
        </h2>
        <p className="mt-3 text-(--color-text)">{profile.education.degree}</p>
        <p className="text-(--color-text-muted)">
          {profile.education.university} &middot; {profile.education.graduation}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Key skills
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

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Problem solving
        </h2>
        <p className="mt-3 text-(--color-text-muted)">
          {profile.problemSolving.total}, primarily in{" "}
          {profile.problemSolving.primaryLanguage}, across{" "}
          {profile.problemSolving.platforms}.
        </p>
      </section>
    </Container>
  );
}
