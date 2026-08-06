import { Container } from "../../components/ui/Container";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { Reveal } from "../../features/motion/Reveal";
import { profile } from "../../data/profile";

export function HeroSection() {
  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow text-(--color-accent-primary)">
            {profile.name.toUpperCase()} / FRONTEND DEVELOPER
          </p>

          <h1 className="display-lg mt-4 text-balance text-(--color-text-primary)">
            {profile.heroHeadline}
          </h1>

          <p className="body-lg mt-6 text-(--color-text-secondary)">
            {profile.heroSupport}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink to="/work" variant="primary" size="lg">
              View Selected Work
            </ButtonLink>
            <ButtonLink to="/about" variant="secondary" size="lg">
              About Me
            </ButtonLink>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <StatusIndicator tone="positive">
              {profile.availabilityStatement}
            </StatusIndicator>
            {profile.resume.available ? (
              <ButtonLink to="/resume" variant="text" size="sm">
                Download résumé
              </ButtonLink>
            ) : (
              <span className="mono-meta text-(--color-text-muted)">
                Résumé — in preparation
              </span>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="relative">
          <div
            className="technical-grid-backdrop relative aspect-4/3 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6"
            aria-hidden="true"
          >
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono text-2xl font-bold text-(--color-text-primary)">
                  {profile.monogram}
                </span>
                <StatusIndicator
                  tone="positive"
                  className="rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-raised) px-3 py-1"
                >
                  Available
                </StatusIndicator>
              </div>

              <div className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4 font-mono text-xs text-(--color-text-secondary)">
                <p>role: &quot;frontend-developer&quot;</p>
                <p>focus: &quot;react, javascript, tailwind&quot;</p>
                <p>expanding: &quot;full-stack, ai-enabled products&quot;</p>
                <p>location: &quot;{profile.location}&quot;</p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
