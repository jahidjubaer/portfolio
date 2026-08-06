import { Mail, ArrowUpRight, MapPin } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { Reveal } from "../features/motion/Reveal";
import { profile } from "../data/profile";

const CONTACT_ENTRIES = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    value: profile.github.replace("https://", ""),
    href: profile.github,
    icon: ArrowUpRight,
  },
  {
    label: "LinkedIn",
    value: profile.linkedin.replace("https://", ""),
    href: profile.linkedin,
    icon: ArrowUpRight,
  },
];

export function ContactPage() {
  usePageMeta({
    title: "Contact — Jahid Hasan",
    description:
      "Get in touch with Jahid Hasan about frontend and junior software engineering opportunities, projects, or collaboration.",
  });

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <SectionLabel>Contact</SectionLabel>
        <h1 className="heading-xl mt-3 text-(--color-text-primary)">
          Get in touch
        </h1>
        <p className="body-lg mt-6 max-w-prose text-(--color-text-secondary)">
          {profile.availabilityStatement}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <StatusIndicator tone="positive">
            {profile.availabilityStatement}
          </StatusIndicator>
          <span className="mono-meta inline-flex items-center gap-1.5 text-(--color-text-muted)">
            <MapPin aria-hidden="true" size={14} />
            {profile.location}
          </span>
        </div>

        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {CONTACT_ENTRIES.map(({ label, value, href, icon: Icon }) => (
            <div
              key={label}
              className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5"
            >
              <dt className="label flex items-center gap-2 text-(--color-text-muted)">
                <Icon aria-hidden="true" size={16} />
                {label}
              </dt>
              <dd className="mt-2">
                <a
                  href={href}
                  target={label === "Email" ? undefined : "_blank"}
                  rel={label === "Email" ? undefined : "noreferrer"}
                  className="body-sm break-all text-(--color-accent-primary) hover:underline"
                >
                  {value}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <p className="body-sm mt-12 text-(--color-text-muted)">
          A direct contact form is being prepared. Until then, email is the
          fastest way to reach me.
        </p>

        <div className="mt-6">
          <ButtonLink href={`mailto:${profile.email}`} variant="primary">
            Email me
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
