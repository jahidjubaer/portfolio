import { RoutePlaceholder } from "../components/ui/RoutePlaceholder";

export function NotFoundPage() {
  return (
    <RoutePlaceholder
      title="Page not found — Jahid Hasan"
      description="The page you requested could not be found."
      heading="Page not found"
      statement="The route you requested does not exist. Return to the homepage to continue."
    />
  );
}
