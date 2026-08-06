import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { profile } from "../data/profile";

export function ContactPage() {
  usePageMeta({
    title: "Contact — Jahid Hasan",
    description:
      "Get in touch with Jahid Hasan about frontend and junior software engineering opportunities, projects, or collaboration.",
  });

  return (
    <Container className="py-20">
      <SectionLabel>Contact</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold text-(--color-text) sm:text-4xl">
        Get in touch
      </h1>
      <p className="mt-6 max-w-prose text-(--color-text-muted)">
        {profile.availabilityStatement} I'm based in {profile.location}.
      </p>

      <dl className="mt-12 space-y-6">
        <div>
          <dt className="text-sm font-semibold text-(--color-text-muted) uppercase">
            Email
          </dt>
          <dd className="mt-1">
            <a
              href={`mailto:${profile.email}`}
              className="text-lg text-(--color-accent) hover:underline"
            >
              {profile.email}
            </a>
          </dd>
        </div>

        <div>
          <dt className="text-sm font-semibold text-(--color-text-muted) uppercase">
            GitHub
          </dt>
          <dd className="mt-1">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="text-lg text-(--color-accent) hover:underline"
            >
              {profile.github.replace("https://", "")}
            </a>
          </dd>
        </div>

        <div>
          <dt className="text-sm font-semibold text-(--color-text-muted) uppercase">
            LinkedIn
          </dt>
          <dd className="mt-1">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-lg text-(--color-accent) hover:underline"
            >
              {profile.linkedin.replace("https://", "")}
            </a>
          </dd>
        </div>

        <div>
          <dt className="text-sm font-semibold text-(--color-text-muted) uppercase">
            Location
          </dt>
          <dd className="mt-1 text-lg text-(--color-text)">
            {profile.location}
          </dd>
        </div>
      </dl>

      <p className="mt-12 text-sm text-(--color-text-muted)">
        A direct contact form is being prepared. Until then, email is the
        fastest way to reach me.
      </p>

      <div className="mt-6">
        <ButtonLink href={`mailto:${profile.email}`} variant="primary">
          Email me
        </ButtonLink>
      </div>
    </Container>
  );
}
