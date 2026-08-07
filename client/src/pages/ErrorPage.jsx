import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";

export function ErrorPage() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  usePageMeta({
    title: is404
      ? "Page not found — Jahid Hasan"
      : "Something went wrong — Jahid Hasan",
    description: "An error occurred while loading this page.",
    robots: "noindex, follow",
  });

  return (
    <main id="main-content">
      <Container as="div" className="section-spacing text-center">
        <p className="eyebrow text-(--color-accent-primary)">
          {is404 ? "Signal lost" : "System error"}
        </p>
        <h1 className="heading-xl mt-4 text-(--color-text-primary)">
          {is404 ? "Page not found" : "Something went wrong"}
        </h1>
        <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
          {is404
            ? "The route you requested does not exist."
            : "An unexpected error occurred while loading this page. Reloading or returning home usually resolves it."}
        </p>
        <div className="mt-8">
          <ButtonLink to="/" variant="primary">
            Return to the homepage
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
