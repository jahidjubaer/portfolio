import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Reveal } from "../features/motion/Reveal";

export function NotFoundPage() {
  usePageMeta({
    title: "Page not found — Jahid Hasan",
    description: "The page you requested could not be found.",
    robots: "noindex, follow",
  });

  return (
    <Container as="div" className="section-spacing text-center">
      <Reveal>
        <p className="eyebrow text-(--color-accent-primary)">
          Signal lost · 404
        </p>
        <h1 className="heading-xl mt-4 text-(--color-text-primary)">
          Page not found
        </h1>
        <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
          The route you requested does not exist. Return to the homepage or
          browse selected work to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/" variant="primary">
            Return home
          </ButtonLink>
          <ButtonLink to="/work" variant="secondary">
            View work
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
