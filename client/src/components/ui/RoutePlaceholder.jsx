import { Link } from "react-router-dom";
import { usePageMeta } from "../../hooks/usePageMeta";
import { Container } from "./Container";

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   heading: string,
 *   statement: string,
 *   showHomeLink?: boolean,
 * }} props
 */
export function RoutePlaceholder({
  title,
  description,
  heading,
  statement,
  showHomeLink = true,
}) {
  usePageMeta({ title, description });

  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-semibold text-(--color-text)">{heading}</h1>
      <p className="mx-auto mt-4 max-w-prose text-(--color-text-muted)">
        {statement}
      </p>
      {showHomeLink ? (
        <Link
          to="/"
          className="mt-8 inline-block text-(--color-accent) hover:underline"
        >
          Return to the homepage
        </Link>
      ) : null}
    </Container>
  );
}
