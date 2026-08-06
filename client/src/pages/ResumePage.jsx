import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Reveal } from "../features/motion/Reveal";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";

export function ResumePage() {
  usePageMeta({
    title: "Résumé — Jahid Hasan",
    description:
      "Résumé summary of Jahid Hasan, a CSE graduate and frontend developer / junior software engineer. The downloadable PDF is being prepared.",
  });

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <SectionLabel>Résumé</SectionLabel>
        <h1 className="heading-xl mt-3 text-(--color-text-primary)">Résumé</h1>

        {profile.resume.available ? (
          <div className="mt-6">
            <ButtonLink
              href={profile.resume.url}
              download={profile.resume.filename}
              variant="primary"
            >
              Download résumé
            </ButtonLink>
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
