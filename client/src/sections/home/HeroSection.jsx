import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { profile } from "../../data/profile";

export function HeroSection() {
  return (
    <section className="border-b border-(--color-border) py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-(--color-accent) uppercase">
            Frontend Developer &middot; Junior Software Engineer
          </p>

          <h1 className="mt-4 text-4xl font-semibold text-balance text-(--color-text) sm:text-5xl">
            {profile.heroHeadline}
          </h1>

          <p className="mt-6 max-w-prose text-base text-(--color-text-muted) sm:text-lg">
            {profile.heroSupport}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink to="/work" variant="primary">
              View Selected Work
            </ButtonLink>
            <ButtonLink to="/about" variant="secondary">
              About Me
            </ButtonLink>
            {profile.resume.available ? (
              <ButtonLink to="/resume" variant="ghost">
                Download Résumé
              </ButtonLink>
            ) : (
              <ButtonLink variant="ghost" disabled>
                Résumé — in preparation
              </ButtonLink>
            )}
          </div>
        </div>

        <div
          className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-mono text-2xl font-bold text-(--color-text)">
                {profile.monogram}
              </span>
              <span className="flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface-elevated) px-3 py-1 font-mono text-xs text-(--color-text-muted)">
                <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
                Available
              </span>
            </div>

            <div className="rounded-xl border border-(--color-border) bg-(--color-surface-elevated) p-4 font-mono text-xs text-(--color-text-muted)">
              <p>role: "frontend-developer"</p>
              <p>focus: "react, javascript, tailwind"</p>
              <p>expanding: "full-stack, ai-enabled products"</p>
              <p>location: "{profile.location}"</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
