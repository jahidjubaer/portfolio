import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Clock, Copy, FileText, Mail } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { siteSettings } from "../data/settings";
import { PAGE_META } from "../routes/route-meta";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { ButtonLink } from "../components/ui/ButtonLink";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { LocalTime } from "../components/ui/LocalTime";
import { GitHubIcon, LinkedInIcon } from "../components/icons/BrandIcons";
import { Reveal } from "../features/motion/Reveal";
import { ContactForm } from "../features/contact/ContactForm";
import { usePreferences } from "../features/preferences/usePreferences";
import { profile } from "../data/profile";

const REACH_OPTIONS = [
  {
    id: "linkedin",
    icon: LinkedInIcon,
    title: "LinkedIn",
    text: "Connect with me and see my background and activity.",
    action: "Open LinkedIn",
    href: profile.linkedin,
  },
  {
    id: "resume",
    icon: FileText,
    title: "Resume",
    text: "A one-page summary of my education, projects, and leadership.",
    action: "View resume",
    to: "/resume",
  },
  {
    id: "github",
    icon: GitHubIcon,
    title: "GitHub",
    text: "Browse my public repositories and recent commits.",
    action: "Open GitHub",
    href: profile.github,
  },
];

function IconTile({ icon: Icon }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) text-(--color-accent-primary)"
    >
      <Icon size={20} />
    </span>
  );
}

export function ContactPage() {
  const { play } = usePreferences();
  const [copied, setCopied] = useState(false);
  const copyResetTimerRef = useRef(null);

  usePageMeta(PAGE_META["/contact"]);

  useEffect(() => () => clearTimeout(copyResetTimerRef.current), []);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      return;
    }
    play("success");
    setCopied(true);
    clearTimeout(copyResetTimerRef.current);
    copyResetTimerRef.current = setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <PageHeader>
        <PageHeaderTitle as="h1">Contact</PageHeaderTitle>
      </PageHeader>

      <div className="grid gap-8 px-4 py-7 sm:px-7">
        <Reveal
          as="section"
          className="glow-surface rounded-[1.375rem] border border-(--color-accent-primary)/25 p-6 sm:p-8"
        >
          <h2 className="text-[1.625rem] font-bold tracking-[-0.02em] text-(--color-text-primary)">
            Let&apos;s work together
          </h2>
          <p className="mt-2.5 max-w-[34em] text-[1.0625rem] text-(--color-text-secondary)">
            Hiring for a frontend, software engineering, or MTO role, or have a
            question? Send a message or email me directly.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.9375rem] text-(--color-text-secondary)">
            {siteSettings.openToWorkBadge ? (
              <span className="inline-flex items-center gap-2.5 rounded-full border border-(--color-accent-primary)/30 bg-(--color-accent-primary-soft) px-3.5 py-1.5 font-semibold text-(--color-accent-primary)">
                <span className="status-dot" aria-hidden="true" />
                Open to new roles
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2">
              <Clock size={16} aria-hidden="true" />
              Sylhet, GMT+6 · <LocalTime className="tabular-nums" />
            </span>
          </div>
        </Reveal>

        <section aria-labelledby="reach-heading">
          <h2
            id="reach-heading"
            className="mb-4 text-[1.3125rem] font-semibold text-(--color-text-primary)"
          >
            Reach me
          </h2>
          <SpotlightCard className="grid gap-4 p-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:p-6">
            <IconTile icon={Mail} />
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-(--color-text-primary)">
                Email
              </h3>
              <p className="mt-1 text-[0.9375rem] text-(--color-text-secondary)">
                The fastest way to reach me about roles, projects, or questions.
              </p>
              <p className="mono-meta mt-3 inline-block max-w-full break-all rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface-raised) px-3 py-2 text-sm text-(--color-text-primary) select-all">
                {profile.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <ButtonLink
                  href={`mailto:${profile.email}`}
                  size="sm"
                  trailingIcon={<ArrowRight size={15} />}
                >
                  Email me
                </ButtonLink>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="inline-flex min-h-10 items-center gap-2 rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface-raised) px-3.5 text-sm font-semibold text-(--color-text-primary) transition-colors hover:border-(--color-text-muted)"
                >
                  {copied ? (
                    <Check size={15} aria-hidden="true" />
                  ) : (
                    <Copy size={15} aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <span role="status" className="sr-only">
                  {copied ? "Email address copied" : ""}
                </span>
              </div>
            </div>
          </SpotlightCard>

          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {REACH_OPTIONS.map((option) => (
              <SpotlightCard
                key={option.id}
                as="li"
                className="flex flex-col p-5"
              >
                <IconTile icon={option.icon} />
                <h3 className="mt-4 text-lg font-semibold text-(--color-text-primary)">
                  {option.title}
                </h3>
                <p className="mt-1 mb-5 text-[0.9375rem] text-(--color-text-secondary)">
                  {option.text}
                </p>
                <ButtonLink
                  to={option.to}
                  href={option.href}
                  target={option.href ? "_blank" : undefined}
                  rel={option.href ? "noreferrer" : undefined}
                  variant="secondary"
                  size="sm"
                  trailingIcon={<ArrowRight size={15} />}
                  className="mt-auto self-start"
                >
                  {option.action}
                </ButtonLink>
              </SpotlightCard>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="message-heading"
          className="rounded-[1.375rem] border border-(--color-border) bg-(--color-surface) p-5 sm:p-7"
        >
          <h2
            id="message-heading"
            className="text-[1.3125rem] font-semibold text-(--color-text-primary)"
          >
            Send a message
          </h2>
          <p className="mt-1.5 text-[0.9375rem] text-(--color-text-secondary)">
            Tell me about the role, project, or question.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
}
