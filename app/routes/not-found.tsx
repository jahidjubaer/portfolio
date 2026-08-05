import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/not-found";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Page not found — Jahid Hasan" },
    {
      name: "description",
      content: "The page you're looking for doesn't exist or may have moved.",
    },
  ];
}

export default function NotFound() {
  return (
    <RoutePlaceholder
      eyebrow="404"
      heading="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
      phaseNote="If you followed a broken link, please report it."
    />
  );
}
