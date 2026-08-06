import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { useDocumentHead } from "../hooks/use-document-head";

export function ErrorPage() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  useDocumentHead({
    title: is404
      ? "Page not found — Jahid Hasan"
      : "Something went wrong — Jahid Hasan",
    description: "An error occurred while loading this page.",
  });

  return (
    <main id="main-content">
      <h1>{is404 ? "Page not found" : "Something went wrong"}</h1>
      <p>
        {is404
          ? "The route you requested does not exist."
          : "An unexpected error occurred while loading this page."}
      </p>
      <Link to="/">Return to the homepage</Link>
    </main>
  );
}
