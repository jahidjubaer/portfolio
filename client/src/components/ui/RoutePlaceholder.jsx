import { usePageMeta } from "../../hooks/usePageMeta";
import { Container } from "./Container";
import { ButtonLink } from "./ButtonLink";
import { Reveal } from "../../features/motion/Reveal";

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   heading: string,
 *   statement: string,
 *   showWorkLink?: boolean,
 * }} props
 */
export function RoutePlaceholder({
  title,
  description,
  heading,
  statement,
  showWorkLink = false,
}) {
  usePageMeta({ title, description });

  return (
    <Container as="div" className="section-spacing text-center">
      <Reveal>
        <h1 className="heading-xl text-(--color-text-primary)">{heading}</h1>
        <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
          {statement}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/" variant="primary">
            Return to the homepage
          </ButtonLink>
          {showWorkLink ? (
            <ButtonLink to="/work" variant="secondary">
              View Work
            </ButtonLink>
          ) : null}
        </div>
      </Reveal>
    </Container>
  );
}
