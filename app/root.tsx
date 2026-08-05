import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./styles/app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  let heading = "Something went wrong";
  let details = "An unexpected error occurred while loading this page.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    heading = isNotFound ? "Page not found" : `Error ${error.status}`;
    details = isNotFound
      ? "The page you're looking for doesn't exist or may have moved."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-24">
      <h1 className="text-3xl font-semibold">{heading}</h1>
      <p className="mt-4 text-base">{details}</p>
      <p className="mt-8">
        <a href="/" className="underline underline-offset-4">
          Return to the homepage
        </a>
      </p>
      {stack && (
        <pre className="mt-8 w-full overflow-x-auto rounded bg-gray-100 p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
