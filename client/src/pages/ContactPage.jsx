import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { Surface } from "../components/ui/Surface";
import { ButtonLink } from "../components/ui/ButtonLink";
import { GitHubIcon, LinkedInIcon } from "../components/icons/BrandIcons";
import { Reveal } from "../features/motion/Reveal";
import { ContactForm } from "../features/contact/ContactForm";
import { profile } from "../data/profile";

const CONTACT_ENTRIES = [
  {
    label: "Email Direct",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
    copyable: true,
  },
  {
    label: "GitHub Profile",
    value: profile.github.replace("https://", ""),
    href: profile.github,
    icon: GitHubIcon,
    copyable: false,
  },
  {
    label: "LinkedIn Profile",
    value: profile.linkedin.replace("https://", ""),
    href: profile.linkedin,
    icon: LinkedInIcon,
    copyable: false,
  },
];

export function ContactPage() {
  const [copied, setCopied] = useState(false);
  const copyResetTimerRef = useRef(null);

  usePageMeta({
    title: "Contact — Jahid Hasan",
    description:
      "Get in touch with Jahid Hasan about frontend and junior software engineering opportunities, projects, or collaboration.",
  });

  useEffect(() => () => clearTimeout(copyResetTimerRef.current), []);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    clearTimeout(copyResetTimerRef.current);
    copyResetTimerRef.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <Container as="div" className="section-spacing max-w-4xl">
      <Reveal>
        <SectionLabel>Contact</SectionLabel>
        <h1 className="heading-xl mt-3 text-(--color-text-primary)">
          Let&apos;s build something together.
        </h1>
        <p className="body-lg mt-4 max-w-prose text-(--color-text-secondary)">
          {profile.availabilityStatement}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="mono-meta inline-flex items-center gap-1.5 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) px-3 py-1 text-xs text-(--color-text-muted)">
            <MapPin aria-hidden="true" size={13} />
            {profile.location}
          </span>
        </div>

        {/* Contact Cards */}
        <ul className="mt-10 grid list-none gap-5 sm:grid-cols-3">
          {CONTACT_ENTRIES.map(
            ({ label, value, href, icon: Icon, copyable }) => (
              <Surface
                key={label}
                as="li"
                variant="raised"
                className="group relative flex flex-col justify-between p-5 transition-all duration-300 hover:border-(--color-accent-primary)/60 hover:shadow-md"
              >
                <div>
                  <div className="label flex items-center justify-between text-(--color-text-muted)">
                    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase text-(--color-text-secondary)">
                      <Icon
                        size={16}
                        className="text-(--color-accent-primary)"
                      />
                      {label}
                    </span>
                    {copyable && (
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex min-touch-target items-center gap-1.5 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) px-3 text-[11px] font-mono text-(--color-accent-primary) transition-all hover:border-(--color-accent-primary) hover:bg-(--color-accent-primary-soft)"
                        aria-label="Copy email address"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <div className="mt-4">
                    <a
                      href={href}
                      target={label === "Email Direct" ? undefined : "_blank"}
                      rel={label === "Email Direct" ? undefined : "noreferrer"}
                      className="body-sm font-medium break-all text-(--color-text-primary) transition-colors group-hover:text-(--color-accent-primary)"
                    >
                      {value}
                    </a>
                  </div>
                </div>
              </Surface>
            ),
          )}
        </ul>
      </Reveal>

      {/* Direct Email — Primary Contact Action */}
      <Reveal className="mt-10">
        <Surface variant="accent" className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h2 className="heading-md text-(--color-text-primary)">
                Email me directly
              </h2>
              <p className="body-sm mt-2 text-(--color-text-secondary)">
                For the fastest response, send me an email.
              </p>
            </div>
            <ButtonLink
              href={`mailto:${profile.email}`}
              variant="primary"
              size="lg"
              trailingIcon={<ArrowRight size={16} />}
            >
              {profile.email}
            </ButtonLink>
          </div>
        </Surface>
      </Reveal>

      {/* Form Section */}
      <Reveal className="mt-14">
        <Surface
          variant="default"
          className="relative p-8 border border-(--color-border) shadow-lg"
        >
          <div className="flex items-center gap-2 text-(--color-accent-primary)">
            <Sparkles size={18} />
            <span className="eyebrow text-xs">Direct Inquiry</span>
          </div>
          <h2 className="heading-md mt-2 text-(--color-text-primary)">
            Send a message
          </h2>
          <p className="body-sm mt-2 max-w-prose text-(--color-text-secondary)">
            Have a project in mind or an open role? Fill out the form below or
            email me directly at{" "}
            <a
              href={`mailto:${profile.email}`}
              className="text-(--color-accent-primary) font-mono underline underline-offset-4"
            >
              {profile.email}
            </a>
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Surface>
      </Reveal>
    </Container>
  );
}
