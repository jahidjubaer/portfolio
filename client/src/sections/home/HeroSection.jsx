import { Container } from "../../components/ui/Container";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { TextLink } from "../../components/ui/TextLink";
import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { Reveal } from "../../features/motion/Reveal";
import { profile } from "../../data/profile";
import { assetManifest } from "../../generated/asset-manifest";
import {
  Download,
  Code2,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="section-spacing border-b border-(--color-border) relative overflow-hidden">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft)/60 px-3.5 py-1 text-xs font-mono text-(--color-accent-primary)">
            <Sparkles size={13} />
            <span>{profile.name.toUpperCase()} / FRONTEND DEVELOPER</span>
          </div>

          <h1 className="display-lg mt-5 text-balance font-bold text-(--color-text-primary)">
            {profile.heroHeadline}
          </h1>

          <p className="body-lg mt-6 text-(--color-text-secondary) leading-relaxed">
            {profile.heroSupport}
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface) px-3.5 py-1.5 text-xs text-(--color-text-secondary)">
              <Code2 size={14} className="text-(--color-accent-primary)" />
              <span>{profile.problemSolving.total}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface) px-3.5 py-1.5 text-xs text-(--color-text-secondary)">
              <GraduationCap
                size={14}
                className="text-(--color-accent-secondary)"
              />
              <span>CSE Grad {profile.education.graduation}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink to="/work" variant="primary" size="lg">
              View Selected Work
            </ButtonLink>
            {profile.resume.available && (
              <ButtonLink
                href={profile.resume.url}
                variant="secondary"
                size="lg"
                download={profile.resume.filename}
                leadingIcon={<Download size={16} />}
              >
                Download Résumé
              </ButtonLink>
            )}
            <TextLink to="/about" className="text-(--color-text-secondary)">
              About me
            </TextLink>
          </div>

          {profile.resume.available && (
            <div className="mt-3">
              <TextLink href={profile.resume.url} className="text-sm">
                <span className="inline-flex items-center gap-1">
                  Preview résumé
                  <ExternalLink size={12} />
                </span>
              </TextLink>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <StatusIndicator tone="positive">
              {profile.availabilityStatement}
            </StatusIndicator>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="relative">
          <div className="group relative mx-auto w-full max-w-sm">
            {/* Animated Glow Backdrop */}
            <div
              className="absolute -inset-1.5 rounded-(--radius-lg) opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
              style={{
                background:
                  "radial-gradient(circle, var(--color-accent-primary) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            <div className="relative overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-xl transition-all duration-300 group-hover:border-(--color-accent-primary)/50">
              <ImageWithFallback
                src={assetManifest.profile.portrait.src}
                fallbackSrc={assetManifest.profile.portrait.fallback}
                alt="Portrait of Jahid Hasan"
                className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
              />

              {/* Floating Tech Chips */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 rounded-(--radius-md) border border-(--color-border)/80 bg-(--color-canvas)/80 p-2.5 backdrop-blur-md">
                <span className="rounded-full bg-(--color-accent-primary-soft) px-2.5 py-0.5 font-mono text-xs font-semibold text-(--color-accent-primary)">
                  React
                </span>
                <span className="rounded-full bg-(--color-surface-soft) px-2.5 py-0.5 font-mono text-xs font-medium text-(--color-text-secondary)">
                  JavaScript
                </span>
                <span className="rounded-full bg-(--color-surface-soft) px-2.5 py-0.5 font-mono text-xs font-medium text-(--color-text-secondary)">
                  Tailwind CSS
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
